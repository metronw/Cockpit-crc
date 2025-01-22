import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/lib/authOptions';
import AsteriskAmi, { AmiResponse, QueueStatusAction, AgentsAction } from 'asterisk-ami';
import prisma from '@/app/lib/localDb';
import phoneConnection from '@/app/lib/phoneDb';

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

    const coreShowChannels = (actionId: string): Promise<AmiResponse[]> => {
      return new Promise((resolve, reject) => {
        const channels: AmiResponse[] = [];
        const onData = (data: AmiResponse) => {
          if (data.ActionID === actionId) {
            channels.push(data);
            if (data.eventlist === 'Complete') {
              amiClient.off('ami_data', onData);
              resolve(channels);
            }
          }
        };
        amiClient.on('ami_data', onData);
        setTimeout(() => {
          amiClient.off('ami_data', onData);
          reject(new Error('Timeout aguardando CoreShowChannels'));
        }, 8000);
      });
    };

    // Conectar ao AMI
    await connectAmi();

    try {
      const actionId = `CoreShowChannels-${Date.now()}`;
      await amiClient.send({ action: 'CoreShowChannels', ActionID: actionId });
      const activeChannels = await coreShowChannels(actionId);

      amiClient.disconnect();

      // Filtrar canais que vieram de filas (exemplo)
      const queueChannels = activeChannels.filter(
        (c) => c.ChannelVariables?.Queue
      );

      // Obter uniqueids
      const uniqueids = queueChannels.map((c) => c.Uniqueid || '').filter(Boolean);

      // Consultar queue_log na base do phoneDb
      const [rows] = await phoneConnection.query(
        'SELECT * FROM queue_log WHERE uniqueid IN (?)',
        [uniqueids]
      );

      return NextResponse.json(
        { activeChannels, queueChannels, queueLog: rows },
        { status: 200 }
      );
    } catch (err: unknown) {
      amiClient.disconnect();
      if (err instanceof Error) {
        console.error('Erro ao processar ações AMI:', err.message);
        return NextResponse.json(
          { error: 'Erro ao obter detalhes das filas' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'Erro ao obter detalhes das filas' },
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
