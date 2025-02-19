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

    let { interfaceName } = await request.json();

    if (!interfaceName) {
      const userPhone = await prisma.user_phone.findUnique({
        where: { user_id: sessionUser }
      });
      if (!userPhone) {
        return NextResponse.json(
          { error: 'Configurações de telefone não encontradas para o usuário, nem fornecida interface.' },
          { status: 404 }
        );
      }
      interfaceName = 'PJSIP/' + userPhone.sip_extension;
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

    await connectAmi();

    try {
      await amiClient.send({ action: 'QueueStatus' } as QueueStatusAction);
      // Usa o helper coletor de eventos definido fora (collectQueueStatusEvents)
      const events = await collectQueueStatusEvents(amiClient);
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

      const responseData = userAssigns
        .flatMap(assign => assign.company.Queue)
        .map(queue => ({
          name: queue.name,
          isMember: queue.asteriskId
            ? (queueMembersMap[queue.asteriskId]?.includes(interfaceName) || false)
            : false,
        }));

      const allAssignedJoined = responseData.every(q => q.isMember);
      const assignedQueueIds = new Set(
        userAssigns.flatMap(assign =>
          assign.company.Queue
            .map(queue => queue.asteriskId)
            .filter((id): id is string => !!id)
        )
      );
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

    let { interfaceName } = await request.json();

    if (!interfaceName) {
      const userPhone = await prisma.user_phone.findUnique({
        where: { user_id: sessionUser }
      });
      if (!userPhone) {
        return NextResponse.json(
          { error: 'Configurações de telefone não encontradas para o usuário' },
          { status: 404 }
        );
      }
      interfaceName = 'PJSIP/' + userPhone.sip_extension;
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
      // Envia a ação QueueStatus para obter dados das filas
      await amiClient.send({ action: 'QueueStatus' } as QueueStatusAction);
      const events = await collectQueueStatusEvents(amiClient);

      let isLoggedInAnyQueue = false;

      // Remove o membro de todas as filas onde estiver logado (verifica stateinterface)
      for (const event of events) {
        if (event.event === 'QueueMember' && event.stateinterface === interfaceName) {
          isLoggedInAnyQueue = true;
          const queueName = event.queue as string;
          const removeAction: QueueRemoveAction = {
            action: 'QueueRemove',
            ActionID: `remove-${queueName}-${interfaceName}`,
            Queue: queueName,
            Interface: interfaceName,
          };
          console.log(`Removendo interface ${interfaceName} da fila ${queueName}`);
          await amiClient.send(removeAction);
        }
      }

      amiClient.disconnect();

      if (!isLoggedInAnyQueue) {
        return NextResponse.json(
          { message: `Interface ${interfaceName} não está logada em nenhuma fila.` },
          { status: 200 }
        );
      }

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

export async function PUT(request: Request) {
  let amiClient: AsteriskAmi | null = null;
  try {
    // Validação da sessão e extração de parâmetros
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user.id;
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Usuário não está logado' },
        { status: 401 }
      );
    }

    let { interfaceName } = await request.json();

    let user_id = sessionUser;

    // Se interfaceName for fornecida, busque o usuário associado à interface
    if (interfaceName) {
      const userPhone = await prisma.user_phone.findUnique({
        where: { sip_extension: interfaceName.replace('PJSIP/', '') }
      });
      if (!userPhone) {
        return NextResponse.json(
          { error: 'Configurações de telefone não encontradas para a interface fornecida' },
          { status: 404 }
        );
      }
      user_id = userPhone.user_id;
    } else {
      // Se interfaceName não for fornecida, busque a extensão do usuário logado
      const userPhone = await prisma.user_phone.findUnique({
        where: { user_id: sessionUser }
      });
      if (!userPhone) {
        return NextResponse.json(
          { error: 'Configurações de telefone não encontradas para o usuário' },
          { status: 404 }
        );
      }
      interfaceName = 'PJSIP/' + userPhone.sip_extension;
    }

    // Criação e conexão com o AMI
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
            return reject(new Error("Erro ao conectar ao AMI"));
          }
          resolve();
        });
      });
    };

    await connectAmi();

    // Coleta de dados das filas
    await amiClient.send({ action: 'QueueStatus' } as QueueStatusAction);
    const events = await collectQueueStatusEvents(amiClient);

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

    // Busca as filas atribuídas ao usuário
    const userAssigns = await prisma.user_assign.findMany({
      where: {
        user_id,
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

    // Ajustes: adicionar filas faltantes e remover filas extras
    let added = 0;
    let removed = 0;

    // Adiciona as filas atribuídas que estiverem faltando
    userAssigns.forEach(assign => {
      assign.company.Queue.forEach(async queue => {
        if (queue.asteriskId) {
          const members = queueMembersMap[queue.asteriskId] || [];
          if (!members.includes(interfaceName)) {
            const action: QueueAddMemberAction = {
              action: 'QueueAdd',
              Queue: queue.asteriskId,
              Interface: interfaceName,
            };
            await amiClient!.send(action);
            added++;
          }
        }
      });
    });

    // Remove as filas em que a interface está logada, mas que não fazem parte das atribuídas
    const assignedQueueIds = new Set(
      userAssigns.flatMap(assign =>
        assign.company.Queue
          .map(queue => queue.asteriskId)
          .filter((id): id is string => !!id)
      )
    );

    Object.entries(queueMembersMap).forEach(async ([queueName, interfaces]) => {
      if (!assignedQueueIds.has(queueName) && interfaces.includes(interfaceName)) {
        const removeAction: QueueRemoveAction = {
          action: 'QueueRemove',
          ActionID: `remove-${queueName}-${interfaceName}`,
          Queue: queueName,
          Interface: interfaceName,
        };
        await amiClient!.send(removeAction);
        removed++;
      }
    });

    amiClient.disconnect();
    return NextResponse.json(
      {
        message: "Filas sincronizadas com sucesso.",
        added,
        removed,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (amiClient) {
      amiClient.disconnect();
    }
    console.error('Erro ao processar requisição UPDATE:', error);
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
    }, 30000);
  });
};
