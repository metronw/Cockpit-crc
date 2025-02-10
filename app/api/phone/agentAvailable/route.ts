// app/api/phone/agentAvailable/route.ts

import { NextResponse } from 'next/server';
// import { getServerSession } from "next-auth";
// import { authOptions } from '@/app/lib/authOptions';
import AsteriskAmi, { AmiResponse, QueueStatusAction } from 'asterisk-ami';
import prisma from '@/app/lib/localDb';

export const dynamic = "force-dynamic";
/**
 * Mapeia o status retornado pela AMI para saber se o agente está em ligação (InUse, Ringing, etc.).
 * Conforme a documentação do Asterisk:
 *  0 = Unknown
 *  1 = NotInUse
 *  2 = InUse
 *  3 = Busy
 *  4 = Invalid
 *  5 = Unavailable
 *  6 = Ringing
 *  7 = RingInUse
 *  8 = OnHold
 */
function isInCall(status?: string | number): boolean {
  // Convertemos para número, caso venha string
  const s = Number(status);
  // "Em ligação" ou "ocupado" se status em 2,3,6,7,8
  return [2, 3, 6, 7, 8].includes(s);
}

/**
 * Formata a data em UTC, retornando uma string no formato ISO 8601.
 * Exemplo: 2025-01-01T13:00:00.000Z
 */
function toUTCISO(date: Date): string {
  return date.toISOString();
}

/**
 * Conecta ao AMI usando o objeto `asterisk-ami`.
 */
function connectAmi(amiClient: AsteriskAmi): Promise<void> {
  return new Promise((resolve, reject) => {
    amiClient.connect((err) => {
      if (err) {
        console.error('Erro ao conectar ao AMI:', err);
        reject(new Error('Erro ao conectar ao AMI'));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Coleciona os eventos até um `eventName` específico, por exemplo "QueueStatusComplete".
 * Útil para aguardar a conclusão de um "dump" de eventos que o Asterisk envia.
 */
function collectEventsUntil(
  amiClient: AsteriskAmi,
  completeEventName: string,
  timeout = 15000
): Promise<AmiResponse[]> {
  return new Promise((resolve, reject) => {
    const events: AmiResponse[] = [];

    const timer = setTimeout(() => {
      console.error(`Timeout aguardando ${completeEventName}`);
      amiClient.off('ami_data', onData);
      reject(new Error(`Timeout aguardando ${completeEventName}`));
    }, timeout);

    const onData = (data: AmiResponse) => {
      events.push(data);
      if (data.event === completeEventName) {
        clearTimeout(timer);
        amiClient.off('ami_data', onData);
        resolve(events);
      }
    };

    amiClient.on('ami_data', onData);
  });
}

/**
 * Busca o status das filas (QueueStatus) e retorna todos os eventos relacionados.
 */
async function fetchQueueStatus(amiClient: AsteriskAmi): Promise<AmiResponse[]> {
  await amiClient.send({ action: 'QueueStatus' } as QueueStatusAction);
  const events = await collectEventsUntil(amiClient, 'QueueStatusComplete');
  return events;
}

/**
 * Busca as informações de contatos PJSIP (latência, status) usando a ação "PJSIPShowContacts".
 */
async function fetchPjsipContacts(amiClient: AsteriskAmi): Promise<Record<string, { online: boolean; latency: number | null }>> {
  // Envia a ação para listar todos os contatos PJSIP
  await amiClient.send({ action: 'PJSIPShowContacts' });
  const events = await collectEventsUntil(amiClient, 'ContactListComplete');

  // Mapeamos cada contato para um objeto com `endpoint` => { online, latency }
  const pjsipMap: Record<string, { online: boolean; latency: number | null }> = {};

  for (const evt of events) {
    if (evt.event === 'ContactStatusDetail' || evt.event === 'ContactList') {
      // Geralmente, o campo "Endpoint" traz algo como "101", "102", etc.
      // Se você usa nomes customizados, ajuste a forma de extrair a extensão.
      const endpoint = evt.endpoint as string;
      if (!endpoint) continue;

      // Status geralmente é "Reachable", "Unreachable", "Unknown", etc.
      const status = evt.status as string;
      const roundtripUsec = typeof evt.roundtripusec === 'string' ? parseInt(evt.roundtripusec, 10) : 0;

      pjsipMap[endpoint] = {
        online: status === 'Reachable',
        latency: roundtripUsec > 0 ? roundtripUsec / 1000 : null, // converte microsegundos em ms
      };
    }
  }

  return pjsipMap;
}

export async function GET(request: Request) {
  try {
    // (Opcional) Se você quiser restringir apenas para usuários logados:
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: 'Usuário não autenticado' },
    //     { status: 401 }
    //   );
    // }

    // Ler parâmetros de busca (query) para possíveis filtros
    const { searchParams } = new URL(request.url);
    const agentNameFilter = searchParams.get('agentName')?.toLowerCase() || '';
    const interfaceFilter = searchParams.get('interface')?.toLowerCase() || '';

    // Inicializar o cliente AMI
    const amiClient = new AsteriskAmi({
      host: process.env.ASTERISK_AMI_HOST || '',
      port: parseInt(process.env.ASTERISK_AMI_PORT || '5038', 10),
      username: process.env.ASTERISK_AMI_USER || '',
      password: process.env.ASTERISK_AMI_PASS || '',
      reconnect: false,
      events: true,
    });

    // 1. Conectar ao AMI
    await connectAmi(amiClient);

    try {
      // 2. Buscar status de todos os contatos PJSIP (para latência e disponibilidade)
      const pjsipMap = await fetchPjsipContacts(amiClient);

      // 3. Buscar status das filas
      const queueEvents = await fetchQueueStatus(amiClient);

      // Encerrar conexão para não ficar em loop
      amiClient.disconnect();

      // Filtrar eventos relevantes
      const queueMemberEvents = queueEvents.filter(
        (evt) => evt.event === 'QueueMember'
      ) as AmiResponse[];

      // Obter todos os registros de filas no banco para mapear asteriskId -> { name, company_id, ... }
      const allDbQueues = await prisma.queue.findMany({
        select: {
          asteriskId: true,
          name: true,
          company_id: true,
          company: {
            select: {
              fantasy_name: true
            }
          }
        }
      });

      const queueMap = allDbQueues.reduce((acc, q) => {
        if (q.asteriskId) {
          acc[q.asteriskId] = {
            name: q.name,
            company_id: q.company_id,
            company_fantasy_name: q.company?.fantasy_name || ''
          };
        }
        return acc;
      }, {} as Record<string, { name: string; company_id: number; company_fantasy_name: string }>);

      // Agrupar eventos por interface para processar cada agente
      const agentsMap = new Map<string, AmiResponse[]>();
      for (const evt of queueMemberEvents) {
        const iface = evt.stateinterface as string;
        if (!iface) continue;
        if (!agentsMap.has(iface)) {
          agentsMap.set(iface, []);
        }
        agentsMap.get(iface)!.push(evt);
      }

      const result = [];

      for (const [iface, memberEvents] of agentsMap.entries()) {
        // Só considera PJSIP (ou mude a condição se usar outro tipo)
        if (!iface.startsWith('PJSIP/')) {
          continue;
        }

        // Ex: 'PJSIP/101' => '101'
        const extension = iface.split('/')[1];

        // Buscar userPhone no Prisma
        const userPhone = await prisma.user_phone.findFirst({
          where: { sip_extension: extension },
        });

        if (!userPhone) {
          // Se não existir userPhone, ignorar
          continue;
        }

        let userId: string | null = null;
        let agentName = `Agente ${extension}`;

        // Carrega o usuário para obter o nome
        if (userPhone.user_id) {
          const user = await prisma.user.findUnique({
            where: { id: userPhone.user_id },
            select: { id: true, name: true },
          });
          if (user) {
            userId = user.id.toString();
            agentName = user.name || agentName;
          }
        }

        // Verificar se está pausado e obter a razão da pausa
        const pausedEvent = memberEvents.find((e) => e.paused === '1');
        
        const anyPaused = !!pausedEvent;
        const pauseReason = pausedEvent?.pausedreason || null;

        // Verificar se está em ligação
        const anyInCall = memberEvents.some((e) => isInCall(e.status as string | number | undefined));

        // Verificar se a extensão está online via PJSIP
        const pjsipData = pjsipMap[extension];
        const extensionOnline = pjsipData?.online ?? false;
        const extensionLatency = pjsipData?.latency ?? null;

        // Disponível somente se:
        //  - Extensão está online
        //  - Não está pausado
        //  - Não está em ligação
        const isAvailable = extensionOnline && !anyPaused && !anyInCall;

        // Monta dados das filas onde esse agente está
        const queueInfos = memberEvents.map((e) => {
          const qb = queueMap[e.queue as string];
          if (!qb) {
          console.error(`Queue não encontrada para ID: ${e.queue}`);
          return {
            name: e.queue,
            company_id: e.queue,
            company_fantasy_name: e.queue,
          };
          }
          return {
          name: qb.name,
          company_id: qb.company_id,
          company_fantasy_name: qb.company_fantasy_name,
          };
        });

        // Datas de login e pause
        const firstEvent = memberEvents[0];
        const loginTs = firstEvent?.logintime
          ? parseInt(firstEvent.logintime as string, 10)
          : 0;
        const pauseTs = firstEvent?.lastpause
          ? parseInt(firstEvent.lastpause as string, 10)
          : 0;

        const pausedSince = anyPaused && pauseTs
          ? toUTCISO(new Date(pauseTs * 1000))
          : null;
        const loggedInSince = loginTs
          ? toUTCISO(new Date(loginTs * 1000))
          : null;

        const data = {
          userId,
          agentName,
          interface: iface,
          queues: queueInfos,
          paused: anyPaused,
          pauseReason, // Adiciona a razão da pausa
          inCall: anyInCall,
          // Indica se a extensão em si está online (PJSIPShowContacts -> "Reachable")
          extensionOnline,
          // Latência em milissegundos
          extensionLatency,
          // Campo final de disponibilidade
          available: isAvailable,

          pausedSince,
          loggedInSince,
        };

        // Filtros opcionais
        const passNameFilter =
          !agentNameFilter || agentName.toLowerCase().includes(agentNameFilter);
        const passInterfaceFilter =
          !interfaceFilter || iface.toLowerCase().includes(interfaceFilter);

        if (passNameFilter && passInterfaceFilter) {
          result.push(data);
        }
      }

      return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
      amiClient.disconnect();
      console.error('Erro ao processar QueueStatus:', error);
      if (error instanceof Error) {
        return NextResponse.json(
          { error: 'Erro ao obter status de agentes' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'Erro ao obter status de agentes' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Erro ao processar requisição GET:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
