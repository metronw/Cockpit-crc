import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/lib/authOptions';
import AsteriskAmi from 'asterisk-ami'; // Substituir 'ami-io' por 'asterisk-ami'
import prisma from '@/app/lib/localDb'; // Ajuste o caminho conforme sua configuração

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

    // Inicializar o cliente asterisk-ami
    const amiClient = new AsteriskAmi({
      host: process.env.ASTERISK_AMI_HOST!,
      port: parseInt(process.env.ASTERISK_AMI_PORT!, 10),
      username: process.env.ASTERISK_AMI_USER!,
      password: process.env.ASTERISK_AMI_PASS!,
      reconnect: false, // Configuração conforme necessidade
    });

    amiClient.on('ami_data', (data: Record<string, any>) => {
      console.info(`AMI DATA: ${JSON.stringify(data)}`);
    });

    amiClient.connect((err) => {
      if (err) {
        console.error("Erro ao conectar ao AMI");
        process.exit();
      }
      console.info("Conexão ao AMI estabelecida");
    });

    try {
      // Enviar ação usando asterisk-ami
      amiClient.send({ action: 'QueuePause', interface: interfaceName, paused: paused ? 'true' : 'false', reason: reason || '' }, (err, response) => {
        if (err || response.response !== 'Success') {
          amiClient.disconnect();
          return NextResponse.json(
            { error: 'Falha ao pausar interface no Asterisk' },
            { status: 500 }
          );
        }

        amiClient.disconnect();

        return NextResponse.json(
          { message: 'Interface pausada com sucesso' },
          { status: 200 }
        );
      });
    } catch (error) {
      amiClient.disconnect();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao processar requisição POST:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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
      reconnect: false, // Configuração conforme necessidade
      events: true,
    });

    // Função para conectar ao AMI
    const connectAmi = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        amiClient.connect((err) => {
          if (err) {
            reject(new Error("Erro ao conectar ao AMI"));
          } else {
            console.info("Conexão ao AMI estabelecida");
            resolve();
          }
        });
      });
    };

    // Função para coletar eventos até 'QueueStatusComplete'
    const collectEvents = (): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        const events: any[] = [];

        const onData = (data: any) => {
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
    await connectAmi().catch((err) => {
      console.error(err.message);
      return NextResponse.json(
        { error: 'Erro ao conectar ao AMI' },
        { status: 500 }
      );
    });

    try {
      await amiClient.send({ action: 'QueueStatus' });

      const events = await collectEvents();

      amiClient.disconnect();

      // Primeiro confirmar se a interface se encontra em ao menos uma das filas
      const isInQueue = events.some(
        (evt: any) =>
          evt.event === 'QueueMember' && evt.stateinterface === interfaceName
      );

      if (!isInQueue) {
        return NextResponse.json(
          { error: 'Interface não encontrada em nenhuma fila' },
          { status: 404 }
        );
      }

      const isPaused = events.some(
        (evt: any) =>
          evt.event === 'QueueMember' &&
          evt.stateinterface === interfaceName &&
          evt.paused === '1'
      );

      return NextResponse.json({ paused: isPaused }, { status: 200 });
    } catch (error) {
      amiClient.disconnect();
      console.error('Erro ao processar QueueStatus:', error.message);
      return NextResponse.json(
        { error: 'Erro ao obter status da fila' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao processar requisição GET:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
