import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/lib/authOptions';
import AsteriskAmi, { AmiResponse, QueueAddMemberAction, QueueStatusAction, QueueRemoveAction } from 'asterisk-ami';
import prisma from '@/app/lib/localDb';

export async function POST(request: Request) {
  let amiClient: AsteriskAmi | null = null;

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

    amiClient = new AsteriskAmi({
      host: process.env.ASTERISK_AMI_HOST!,
      port: parseInt(process.env.ASTERISK_AMI_PORT!, 10),
      username: process.env.ASTERISK_AMI_USER!,
      password: process.env.ASTERISK_AMI_PASS!,
      reconnect: false,
      events: true,
    });

    const connectAmi = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        amiClient?.connect((err: Error | null) => {
          if (err) {
            console.error("Erro ao conectar ao AMI:", err.message);
            return reject(new Error("Erro ao conectar ao AMI"));
          }
          resolve();
        });
      });
    };

    await connectAmi();

    try {
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
    if (amiClient !== null) {
      amiClient.disconnect();
    }
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
  let amiClient: AsteriskAmi | null = null;

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

    amiClient = new AsteriskAmi({
      host: process.env.ASTERISK_AMI_HOST!,
      port: parseInt(process.env.ASTERISK_AMI_PORT!, 10),
      username: process.env.ASTERISK_AMI_USER!,
      password: process.env.ASTERISK_AMI_PASS!,
      reconnect: false,
      events: true,
    });

    const connectAmi = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        amiClient?.connect((err) => {
          if (err) {
            reject(new Error("Erro ao conectar ao AMI"));
          } else {
            resolve();
    }
        });
      });
    };

    const collectEvents = (): Promise<AmiResponse[]> => {
      return new Promise((resolve, reject) => {
        const events: AmiResponse[] = [];

        const onData = (data: AmiResponse) => {
          events.push(data);
          if (data.event === 'QueueStatusComplete') {
            amiClient?.off('ami_data', onData);
            resolve(events);
          }
        };

        amiClient?.on('ami_data', onData);

        setTimeout(() => {
          amiClient?.off('ami_data', onData);
          reject(new Error('Timeout aguardando QueueStatusComplete'));
        }, 10000);
      });
    };

    await connectAmi();

    try {
      await amiClient.send({ action: 'QueueStatus' } as QueueStatusAction);
      const events = await collectEvents();

      amiClient.disconnect();

      const queueMembersMap: { [queueName: string]: string[] } = {};

      events.forEach(evt => {
        if (evt.event === 'QueueMember') {
          const queueName = evt.queue as string;
          const memberInterface = evt.stateinterface as string;
          if (!queueMembersMap[queueName]) {
            queueMembersMap[queueName] = [];
          }
          queueMembersMap[queueName].push(memberInterface);
        }
      });

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

      const responseData = userAssigns.map(assign => {
        return assign.company.Queue.map(queue => {
          const isMember = queue.asteriskId
            ? (queueMembersMap[queue.asteriskId as string]?.includes(interfaceName) || false)
            : false;
          return {
            name: queue.name,
            isMember,
          };
        });
      }).flat();

      // Calcular duas validações cruciais:
      // 1. A interface é membro de TODAS as filas atribuídas?
      // 2. A interface NÃO é membro de nenhuma fila não atribuída?
      const allAssignedJoined = responseData.every(q => q.isMember);

      // Obter todos os IDs de filas atribuídas (apenas os existentes)
      const assignedQueueIds = new Set(
        userAssigns.flatMap(assign => 
          assign.company.Queue
            .map(queue => queue.asteriskId)
            .filter((id): id is string => !!id)  // Type guard para filtrar null/undefined
        )
      );

      // Verificar se o membro existe em alguma fila não atribuída
      let noExtraQueues = true;
      for (const queueName of Object.keys(queueMembersMap)) {
        if (!assignedQueueIds.has(queueName) && 
            queueMembersMap[queueName].includes(interfaceName)) {
          noExtraQueues = false;
          break;
        }
      }

      return NextResponse.json({
        interfaceName,
        queues: responseData,
        validation: {
          allAssignedJoined,
          noExtraQueues,
          properlyConfigured: allAssignedJoined && noExtraQueues
        }
      }, { status: 200 });
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
    if (amiClient) {
      amiClient.disconnect();
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
  let amiClient: AsteriskAmi | null = null;

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

    amiClient = new AsteriskAmi({
      host: process.env.ASTERISK_AMI_HOST!,
      port: parseInt(process.env.ASTERISK_AMI_PORT!, 10),
      username: process.env.ASTERISK_AMI_USER!,
      password: process.env.ASTERISK_AMI_PASS!,
      reconnect: false,
      events: true,
    });

    const connectAmi = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        amiClient?.connect((err: Error | null) => {
          if (err) {
            console.error("Erro ao conectar ao AMI:", err.message);
            return reject(new Error("Erro ao conectar ao AMI"));
          }
          resolve();
        });
      });
    };

    await connectAmi();

    try {
      const action: QueueStatusAction = { action: 'QueueStatus' };
      await amiClient.send(action);

      const events = await collectQueueStatusEvents(amiClient);

      for (const event of events) {
        if (event.event === 'QueueMember' && event.interface === interfaceName) {
          const queueName = event.queue as string;

          const removeAction: QueueRemoveAction = {
            action: 'QueueRemove',
            // add timestamp to ActionID
            ActionID: `remove-${queueName}-${interfaceName}`,
            Queue: queueName,
            Interface: interfaceName,
          };
          await amiClient.send(removeAction);
        }
      }

      amiClient.disconnect();

      return NextResponse.json(
        { message: `Interface ${interfaceName} removida das filas com sucesso.` },
        { status: 200 }
      );
    } catch (error: unknown) {
      if (amiClient) {
        amiClient.disconnect();
      }
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
    if (amiClient) {
      amiClient.disconnect();
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

const collectQueueStatusEvents = (amiClient: AsteriskAmi): Promise<AmiResponse[]> => {
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

    setTimeout(() => {
      amiClient.off('ami_data', onData);
      reject(new Error('Timeout aguardando QueueStatusComplete'));
    }, 10000);
  });
};
