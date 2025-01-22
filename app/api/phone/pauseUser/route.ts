import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/lib/authOptions';
import AsteriskAmi, { AmiResponse, QueuePauseAction, QueueStatusAction } from 'asterisk-ami';
import prisma from '@/app/lib/localDb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user.id;

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Usuário não está logado' },
        { status: 401 }
      );
    }

    const { interfaceName, paused, reason } = await request.json();

    if (!interfaceName || paused === undefined) {
      return NextResponse.json(
        { error: 'Dados insuficientes' },
        { status: 400 }
      );
    }

    // 1. Inicializar o cliente AMI
    const amiClient = new AsteriskAmi({
      host: process.env.ASTERISK_AMI_HOST!,
      port: parseInt(process.env.ASTERISK_AMI_PORT!, 10),
      username: process.env.ASTERISK_AMI_USER!,
      password: process.env.ASTERISK_AMI_PASS!,
      reconnect: false,
      events: true,
    });

    // Função para conectar ao AMI
    const connectAmi = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        amiClient.connect((err: Error | null) => {
          if (err) {
            console.error("Erro ao conectar ao AMI:", err.message);
            return reject(new Error("Erro ao conectar ao AMI"));
          }
          // console.info("Conexão ao AMI estabelecida");
          resolve();
        });
      });
    };

    // Função para coletar eventos até 'QueueStatusComplete'
    const collectQueueStatusEvents = (): Promise<AmiResponse[]> => {
      return new Promise((resolve, reject) => {
        const events: AmiResponse[] = [];

        const onData = (data: AmiResponse) => {
          events.push(data);
          if (data.event === 'QueueStatusComplete') {
            amiClient.off('ami_data', onData);
            resolve(events);
          }
        };

        amiClient.on('ami_data', onData);

        // Timeout para evitar espera indefinida
        setTimeout(() => {
          amiClient.off('ami_data', onData);
          reject(new Error('Timeout aguardando QueueStatusComplete'));
        }, 10000); // 10 segundos
      });
    };

    await connectAmi(); // Conecta ao AMI

    try {
      // 2. Envia a ação QueuePause
      try {
        const action: QueuePauseAction = {
          action: 'QueuePause',
          Interface: interfaceName,
          Paused: paused ? 'true' : 'false',
          Reason: reason || '',
        };

        await amiClient.send(action);
        console.log("Comando QueuePause enviado com sucesso");
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Erro ao enviar comando ao AMI:", err.message);
          throw new Error("Erro ao pausar interface no Asterisk");
        }
        throw err;
      }

      // 3. Agora pedimos o QueueStatus para confirmar a mudança
      await amiClient.send({ action: 'QueueStatus' } as QueueStatusAction);
      const events = await collectQueueStatusEvents();

      // 4. Verificamos se a interface consta nas filas e se ficou pausada/despausada
      const isInQueue = events.some(
        (evt: AmiResponse) =>
          evt.event === 'QueueMember' && evt.stateinterface === interfaceName
      );

      if (!isInQueue) {
        // Importante: pode ser que o membro não pertença a nenhuma fila, então não foi realmente pausado
        amiClient.disconnect();
        return NextResponse.json(
          { error: 'Interface não encontrada em nenhuma fila' },
          { status: 404 }
        );
      }

      // Verifica se a interface está com paused=1 nas filas
      const isPaused = events.some(
        (evt: AmiResponse) =>
          evt.event === 'QueueMember' &&
          evt.stateinterface === interfaceName &&
          evt.paused === '1'
      );

      amiClient.disconnect();

      // 5. Retorna o estado final
      return NextResponse.json(
        {
          message: `Interface ${interfaceName} ${
            paused ? 'pausada' : 'despausada'
          } com sucesso.`,
          paused: isPaused,
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      amiClient.disconnect();
      if (error instanceof Error) {
        console.error("Erro ao processar comando AMI:", error.message);
        return NextResponse.json(
          { error: error.message || 'Erro interno no servidor' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'Erro interno no servidor' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Erro ao processar requisição POST:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Erro interno no servidor' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user.id;

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Usuário não está logado' },
        { status: 401 }
      );
    }

    const userPhone = await prisma.user_phone.findUnique({
      where: { user_id: sessionUser },
    });

    if (!userPhone) {
      return NextResponse.json(
        { error: 'Configurações de telefone não encontradas para o usuário' },
        { status: 404 }
      );
    }

    const interfaceName = 'PJSIP/' + userPhone.sip_extension;

    // Inicializar o cliente asterisk-ami
    const amiClient = new AsteriskAmi({
      host: process.env.ASTERISK_AMI_HOST!,
      port: parseInt(process.env.ASTERISK_AMI_PORT!, 10),
      username: process.env.ASTERISK_AMI_USER!,
      password: process.env.ASTERISK_AMI_PASS!,
      reconnect: false, 
      events: true,
    });

    // Função para conectar ao AMI
    const connectAmi = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        amiClient.connect((err) => {
          if (err) {
            reject(new Error("Erro ao conectar ao AMI"));
          } else {
            // console.info("Conexão ao AMI estabelecida");
            resolve();
          }
        });
      });
    };

    // Função para coletar eventos até 'QueueStatusComplete'
    const collectEvents = (): Promise<AmiResponse[]> => {
      return new Promise((resolve, reject) => {
        const events: AmiResponse[] = [];

        const onData = (data: AmiResponse) => {
          events.push(data);
          if (data.event === 'QueueStatusComplete') {
            amiClient.off('ami_data', onData);
            resolve(events);
          }
        };

        amiClient.on('ami_data', onData);

        // Timeout para evitar espera indefinida
        setTimeout(() => {
          amiClient.off('ami_data', onData);
          reject(new Error('Timeout aguardando QueueStatusComplete'));
        }, 10000); // 10 segundos
      });
    };

    // Conectar ao AMI
    await connectAmi();

    try {
      await amiClient.send({ action: 'QueueStatus' } as QueueStatusAction);
      const events = await collectEvents();

      amiClient.disconnect();

      // Primeiro confirmar se a interface se encontra em ao menos uma das filas
      const isInQueue = events.some(
        (evt: AmiResponse) =>
          evt.event === 'QueueMember' && evt.stateinterface === interfaceName
      );

      if (!isInQueue) {
        return NextResponse.json(
          { error: 'Interface não encontrada em nenhuma fila' },
          { status: 404 }
        );
      }

      const isPaused = events.some(
        (evt: AmiResponse) =>
          evt.event === 'QueueMember' &&
          evt.stateinterface === interfaceName &&
          evt.paused === '1'
      );

      return NextResponse.json({ paused: isPaused }, { status: 200 });
    } catch (error: unknown) {
      amiClient.disconnect();
      if (error instanceof Error) {
        console.error('Erro ao processar QueueStatus:', error.message);
        return NextResponse.json(
          { error: 'Erro ao obter status da fila' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'Erro ao obter status da fila' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Erro ao processar requisição GET:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Erro interno no servidor' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
