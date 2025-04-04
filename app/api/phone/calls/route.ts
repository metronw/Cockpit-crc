import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import AsteriskAmi, { AmiResponse, QueueLogRow } from "asterisk-ami"; // Importar QueueLogRow
import prisma from "@/app/lib/localDb";
import phoneConnection from "@/app/lib/phoneDb";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 5 }); // TTL de 60 segundos

/**
 * Interpret the raw queue_log row into a more readable event structure.
 */
function interpretQueueLogEvent(row: QueueLogRow) {
  const { time, callid, queuename, agent, event, data1, data2, data3 } = row;

  switch (event) {
    case "CONNECT":
      return {
        time,
        callid,
        queuename,
        agent,
        eventType: event,
        holdTime: data1,
        bridgedChannelUniqueId: data2,
        ringTime: data3,
      };
    case "ENTERQUEUE":
      return {
        time,
        callid,
        eventType: event,
        callerId: data2,
        queuename,
      };
    default:
      return {
        time,
        callid,
        queuename,
        agent,
        eventType: event,
        message: `Unknown event type: ${event}`,
      };
  }
}

export async function GET() {
  try {
    // Verificar se os dados já estão no cache
    const cachedData = cache.get("queueData");
    if (cachedData) {
      return NextResponse.json(cachedData, { status: 200 });
    }

    // 1. Check session
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user?.id;
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Usuário não está logado" },
        { status: 401 }
      );
    }

    // 3. Connect to AMI (only if user phone config exists)
    const amiClient = new AsteriskAmi({
      host: process.env.ASTERISK_AMI_HOST!,
      port: parseInt(process.env.ASTERISK_AMI_PORT!, 10),
      username: process.env.ASTERISK_AMI_USER!,
      password: process.env.ASTERISK_AMI_PASS!,
      reconnect: false,
      events: false, // Turn off events unless you specifically need them
    });

    const connectAmi = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        amiClient.connect((err) => {
          if (err) {
            reject(new Error("Erro ao conectar ao AMI: " + err.message));
          } else {
            resolve();
          }
        });
      });
    };

    // 4. Helper to wait for CoreShowChannels response
    const coreShowChannels = (actionId: string): Promise<AmiResponse[]> => {
      return new Promise((resolve, reject) => {
        const channels: AmiResponse[] = [];

        function onData(data: AmiResponse) {
          if (data.actionid === actionId) {
            // Collect all relevant events
            channels.push(data);

            // Check for the completion event
            if (data.eventlist === "Complete") {
              amiClient.off("ami_data", onData);
              resolve(channels);
            }
          }
        }

        amiClient.on("ami_data", onData);

        setTimeout(() => {
          amiClient.off("ami_data", onData);
          reject(new Error("Timeout aguardando CoreShowChannels"));
        }, 20000);
      });
    };

    // 5. Connect to AMI and fetch channels
    await connectAmi();
    const actionId = `CoreShowChannels-${Date.now()}`;
    await amiClient.send({ action: "CoreShowChannels", ActionID: actionId });

    let channels: AmiResponse[];
    try {
      channels = await coreShowChannels(actionId);
    } finally {
      // Ensure we disconnect even if there's an error
      amiClient.disconnect();
    }

    // 6. Filter relevant channels (Queue calls)
    const activeChannels = channels.filter((c) => c.event === "CoreShowChannel");
    const queueChannels = activeChannels.filter(
      (c) => c.application === "Queue"
    );

    // Extract uniqueids from queue channels
    const uniqueids = queueChannels
      .map((c) => c.uniqueid || "")
      .filter(Boolean);

    // If there are no queue channels, return early
    if (uniqueids.length === 0) {
      return NextResponse.json(
        {
          activeChannels,
          queueChannels,
          queueLog: {
            waitingCalls: [],
            connectedCalls: [],
          },
        },
        { status: 200 }
      );
    }

    // 7. Query the queue_log table
    const [rows] = await phoneConnection.query(
      "SELECT * FROM queue_log WHERE callid IN (?)",
      [uniqueids]
    ) as unknown as [QueueLogRow[], unknown];
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        {
          activeChannels,
          queueChannels,
          queueLog: {
            waitingCalls: [],
            connectedCalls: [],
          },
        },
        { status: 200 }
      );
    }

    // 8. Build a map: queueName -> company
    //    Get all unique queueNames from these rows
    const queueNames = Array.from(new Set(rows.map((r: QueueLogRow) => r.queuename)));
    const queueList = await prisma.queue.findMany({
      where: { asteriskId: { in: queueNames } },
      select: {
        asteriskId: true,
        company: {
          select: { id: true, fantasy_name: true },
        },
      },
    });
    // Create a quick lookup for queue -> company
    const queueToCompany = new Map(
      queueList.map((q) => [q.asteriskId, q.company])
    );

    // 9. Build a map: sipExtension -> User
    //    We parse the rows for each agent
    const rawSipExtensions = rows
      .map((r: QueueLogRow) => {
        if (!r.agent) return null;
        // Agent might be PJSIP/101 or SIP/101 or Local/100@...
        const parts = r.agent.split("/");
        return parts?.[1] || null; // e.g. "101"
      })
      .filter((ext: string | null) => ext && /^\d+$/.test(ext)); // keep only numeric
    const sipExtensions = Array.from(new Set(rawSipExtensions.filter((ext): ext is string => ext !== null)));

    // If we have any valid sipExtensions, we can look them up in user_phone
    let extensionToUser: Map<string, { id: number; name: string }> = new Map();
    if (sipExtensions.length > 0) {
      // fetch user_phone for all of them
      const userPhones = await prisma.user_phone.findMany({
        where: {
          sip_extension: {
            in: sipExtensions,
          },
        },
        select: {
          sip_extension: true,
          user_id: true,
        },
      });

      // get user IDs
      const userIds = userPhones.map((up) => up.user_id);
      const uniqueUserIds = Array.from(new Set(userIds));

      // fetch users for those userIds
      const users = await prisma.user.findMany({
        where: { id: { in: uniqueUserIds } },
        select: { id: true, name: true },
      });

      // create userId -> user map
      const userIdToUser = new Map(users.map((u) => [u.id, u]));

      // map the sipExtension to the user
      extensionToUser = new Map(
        userPhones.map((up) => {
          const user = userIdToUser.get(up.user_id);
          return [up.sip_extension, user!];
        })
      );
    }

    // 10. Interpret each row and attach extra info
    const interpretedQueueLog = rows.map((row: QueueLogRow) => {
      const eventObj = interpretQueueLogEvent(row);

      // attach company
      const company = queueToCompany.get(row.queuename) || null;

      // attach user if agent is found
      const agent = row.agent || "";
      let user = null;
      const parts = agent.split("/");
      if (parts?.[1] && extensionToUser.has(parts[1])) {
        user = extensionToUser.get(parts[1]);
      }

      return {
        ...eventObj,
        company,
        user,
      };
    });

    // 11. Separate waiting calls and connected calls
    const connectedCallIds = new Set(
      interpretedQueueLog
        .filter((log) => log.eventType === "CONNECT")
        .map((log) => log.callid)
    );

    const ringNoAnswerCallIds = new Set(
      interpretedQueueLog
        .filter((log) => log.eventType === "RINGNOANSWER")
        .map((log) => log.callid)
    );

    const waitingCalls = interpretedQueueLog.filter((log) =>
      ["ENTERQUEUE"].includes(log.eventType) &&
      !connectedCallIds.has(log.callid) &&
      !ringNoAnswerCallIds.has(log.callid)
    );

    const connectedCalls = interpretedQueueLog.filter(
      (log) => log.eventType === "CONNECT"
    );

    // 12. Return the data
    const responseData = {
      activeChannels,
      queueChannels,
      queueLog: {
        waitingCalls,
        connectedCalls,
      },
    };

    // Armazenar os dados no cache
    cache.set("queueData", responseData);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Erro interno no servidor", message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno no servidor", message: "Erro desconhecido" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não está logado" },
        { status: 401 }
      );
    }

    const { channel, cause } = await request.json();

    if (!channel || typeof channel !== 'string') {
      return NextResponse.json(
        { error: "Parâmetro 'channel' é obrigatório e deve ser uma string." },
        { status: 400 }
      );
    }

    const amiClient = new AsteriskAmi({
      host: process.env.ASTERISK_AMI_HOST!,
      port: parseInt(process.env.ASTERISK_AMI_PORT!, 10),
      username: process.env.ASTERISK_AMI_USER!,
      password: process.env.ASTERISK_AMI_PASS!,
      reconnect: false,
      events: false,
    });

    const connectAmi = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        amiClient.connect((err) => {
          if (err) {
            reject(new Error("Erro ao conectar ao AMI: " + err.message));
          } else {
            resolve();
          }
        });
      });
    };

    const sendHangupAction = (actionId: string): Promise<AmiResponse> => {
      return new Promise((resolve, reject) => {
        function onResponse(data: AmiResponse) {
          if (data.actionid === actionId) {
            amiClient.off("ami_data", onResponse);
            if (data.response === 'Success') {
              resolve(data);
            } else {
              reject(new Error(data.message as string || 'Falha ao desligar o canal'));
            }
          }
        }

        amiClient.on("ami_data", onResponse);

        const hangupPayload: { action: 'Hangup', Channel: string, ActionID: string, Cause?: number } = {
          action: "Hangup",
          Channel: channel,
          ActionID: actionId,
        };
        if (cause !== undefined) {
          hangupPayload.Cause = cause;
        }

        amiClient.send(hangupPayload, (err) => {
          if (err) {
            amiClient.off("ami_data", onResponse);
            reject(err);
          }
        });

        setTimeout(() => {
          amiClient.off("ami_data", onResponse);
          reject(new Error("Timeout aguardando resposta da ação Hangup"));
        }, 5000);
      });
    };

    try {
      await connectAmi();
      const actionId = `Hangup-${Date.now()}`;
      const response = await sendHangupAction(actionId);
      return NextResponse.json({ success: true, message: "Canal desligado com sucesso.", details: response }, { status: 200 });
    } finally {
      amiClient.disconnect();
    }
  } catch (error: unknown) {
    let errorMessage = "Erro desconhecido";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Erro na API Hangup:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor", message: errorMessage },
      { status: 500 }
    );
  }
}
