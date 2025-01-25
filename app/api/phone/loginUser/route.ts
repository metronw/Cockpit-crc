import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/lib/authOptions';
import AsteriskAmi, { AmiResponse, QueueAddMemberAction, QueueStatusAction, QueueRemoveAction } from 'asterisk-ami';
import prisma from '@/app/lib/localDb';

// Definir amiClient no escopo externo para que esteja acessível nos blocos catch
let amiClient: AsteriskAmi;

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

    const { interfaceName } = await request.json();

    if (!interfaceName) {
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
          resolve();
        });
      });
    };

    await connectAmi(); // Conecta ao AMI

    try {
      // Após autenticação do usuário
      const userAssigns = await prisma.user_assign.findMany({
        where: {
          user_id: sessionUser,
          queue_type: 1,
        },
        include: {
          company: {
            include: {
              Queue: true,
            },
          },
        },
      });

      for (const assign of userAssigns) {
        for (const queue of assign.company.Queue) {
          if (queue.asteriskId) {
            const action: QueueAddMemberAction = {
              action: 'QueueAdd',
              Queue: queue.asteriskId,
              Interface: interfaceName,
            };
            await amiClient.send(action);
          }
        }
      }

      amiClient.disconnect();

      return NextResponse.json(
        { message: `Interface ${interfaceName} logada nas filas com sucesso.` },
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
    amiClient = new AsteriskAmi({
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

      // Atualiza o mapeamento de filas e membros com as propriedades corretas
      const queueMembersMap: { [queueName: string]: string[] } = {};

      events.forEach(evt => {
        if (evt.event === 'QueueMember') {
          const queueName = evt.queue as string; // Asserção de tipo
          const memberInterface = evt.stateinterface as string; // Asserção de tipo
          if (!queueMembersMap[queueName]) {
            queueMembersMap[queueName] = [];
          }
          queueMembersMap[queueName].push(memberInterface);
        }
      });

      // Recupera as filas atribuídas ao usuário
      const userAssigns = await prisma.user_assign.findMany({
        where: {
          user_id: sessionUser,
          queue_type: 1,
        },
        include: {
          company: {
            include: {
              Queue: true,
            },
          },
        },
      });

      // Construir a resposta correlacionando filas atribuídas e status da interface
      const responseData = userAssigns.map(assign => {
        return assign.company.Queue.map(queue => {
          const isMember = queue.asteriskId
            ? (queueMembersMap[queue.asteriskId as string]?.includes(interfaceName) || false)
            : false;
          return {
            name: queue.name, // Nome da fila na aplicação
            isMember,
          };
        });
      }).flat();

      return NextResponse.json({ queues: responseData }, { status: 200 });
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
    if (amiClient) { // Verificação se amiClient está definido
      amiClient.disconnect(); // 'amiClient' agora está definido nesse escopo
    }
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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user.id;

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Usuário não está logado' },
        { status: 401 }
      );
    }

    const { interfaceName } = await request.json();

    if (!interfaceName) {
      return NextResponse.json(
        { error: 'Dados insuficientes' },
        { status: 400 }
      );
    }

    // 1. Inicializar o cliente AMI
    amiClient = new AsteriskAmi({
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
          resolve();
        });
      });
    };

    await connectAmi(); // Conecta ao AMI

    try {
      // Após autenticação do usuário
      const userAssigns = await prisma.user_assign.findMany({
        where: {
          user_id: sessionUser,
          queue_type: 1, // Ajuste conforme necessidade
        },
        include: {
          company: {
            include: {
              Queue: true,
            },
          },
        },
      });

      for (const assign of userAssigns) {
        for (const queue of assign.company.Queue) {
          if (queue.asteriskId) {
            const action: QueueRemoveAction = {
              action: 'QueueRemove',
              ActionID: `remove-${queue.asteriskId}-${interfaceName}`,
              Queue: queue.asteriskId,
              Interface: interfaceName,
            };
            await amiClient.send(action);
          }
        }
      }

      amiClient.disconnect();

      return NextResponse.json(
        { message: `Interface ${interfaceName} removida das filas com sucesso.` },
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
    if (amiClient) { // Verificação se amiClient está definido
      amiClient.disconnect(); // 'amiClient' agora está definido nesse escopo
    }
    console.error('Erro ao processar requisição DELETE:', error);
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
