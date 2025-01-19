"use client";
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import JsSIP from 'jssip';
// import RTCSession from 'jssip/lib/RTCSession';
import useSWR from 'swr';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiPhoneCall, FiPhoneOff, FiMicOff, FiMic } from 'react-icons/fi';
import { useRouter } from "next/navigation";
import { useTicketContext } from '@/app/agent/providers';

JsSIP.debug.enable('');

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface WebPhoneProps {
  onCallStatusChange: (status: string) => void;
}

interface WebPhoneHandle {
  handleAnswerCall: () => void;
}

interface PrefixOption {
  number: string;
  name: string;
}

type RTCSession = {
  connection: RTCPeerConnection;
  direction: "incoming" | "outgoing";
  start_time: Date | null;
  display_name: string;
  end_time: Date | null;
  local_identity: { uri: string };
  remote_identity: { display_name: string, uri: { user: string } };
  sendDTMF: (digit: string) => void
  answer: (mediaStream: string) => void
  terminate: () => void
  isEstablished: () => boolean
  on(event: string, handler: (e: RTCSession) => void): void;
  off(event: string, handler: (e: RTCSession) => void): void;
};


interface RTCSessionEndedEvent {
  originator: 'local' | 'remote';
}

// interface RTCSessionFailedEvent {
//   // Add relevant properties if needed
// }

const WebPhone = forwardRef<WebPhoneHandle, WebPhoneProps>(({ onCallStatusChange }, ref) => {
  const [session, setSession] = useState<RTCSession | null>(null);
  const uaRef = useRef<JsSIP.UA | null>(null);
  const [callStatus, setCallStatus] = useState('Idle');
  const [numberToCall, setNumberToCall] = useState('');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [prefixOptions, setPrefixOptions] = useState<PrefixOption[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [incomingCall, setIncomingCall] = useState<RTCSession | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [callerNumber, setCallerNumber] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  const answerAudioRef = useRef<HTMLAudioElement | null>(null);
  const dialtoneAudioRef = useRef<HTMLAudioElement | null>(null);
  const hangupAudioRef = useRef<HTMLAudioElement | null>(null);

  const { data: userData, error: userError } = useSWR('/api/phone/user', fetcher);
  const { data: prefixesData, error: prefixesError } = useSWR('/api/phone/prefix', fetcher);

  const router = useRouter();
  const { ticketContext, setTicketContext } = useTicketContext();

  useEffect(() => {
    if (!userData) return;
    if (!userData.error) {
      setIsReady(true);
    }
  }, [userData]);

  useEffect(() => {
    if (!userData || !isReady) return;

    const socket = new JsSIP.WebSocketInterface(userData.sip_websocket);
    const configuration = {
      sockets: [socket],
      uri: `sip:${userData.sip_extension}@${userData.sip_server}`,
      password: userData.sip_password,
      register: true,
    };

    uaRef.current = new JsSIP.UA(configuration);

    uaRef.current.start();

    uaRef.current.on('connected', () => {
      console.log('Conectado ao servidor SIP');
    });

    uaRef.current.on('registrationFailed', (e) => {
      console.error('Falha no registro:', e.cause);
    });

    // @ts-expect-error: fix later
    uaRef.current.on('newRTCSession', ({ session }: { RTCSession }) => {
      const newSession: RTCSession = session;
      setSession(newSession);

      if (newSession.direction === 'incoming') {
        setCallerName(newSession.remote_identity.display_name || 'Desconhecido');
        setCallerNumber(newSession.remote_identity.uri.user || 'Desconhecido');

        callStatus === 'Incoming Call' && answerAudioRef.current?.play();

        setCallStatus('Incoming Call');
        onCallStatusChange('Incoming Call');

        console.log(`User autoanswer ${userData.auto_answer}`);

        if (!userData.auto_answer) {
          setIncomingCall(newSession);
          if (ringAudioRef.current) {
            ringAudioRef.current.loop = true;
            ringAudioRef.current.play();
          }

        } else {
          if (ringAudioRef.current) {
            ringAudioRef.current.play();
            setTimeout(() => {
              ringAudioRef.current?.pause();
              if (ringAudioRef.current) {
                ringAudioRef.current.currentTime = 0;
              }
              // @ts-expect-error: fix later
              newSession.answer({ mediaStream: localStreamRef.current });
              setupPeerConnection(newSession);
            }, 3000);
          }
        }
      }

      if (newSession.direction === 'outgoing') {
        setCallerName(newSession.remote_identity.display_name || 'Desconhecido');
        setCallerNumber(newSession.remote_identity.uri.user || 'Desconhecido');
      }

      // @ts-expect-error: fix later
      newSession.on('ended', (e: RTCSessionEndedEvent) => {
        setCallStatus('Call Ended');
        setSession(null);
        setIncomingCall(null);
        setCallerName('');
        setCallerNumber('');
        releaseStream();
        toast.info('Chamada encerrada por: ' + (e.originator === 'local' ? 'Local' : 'Remoto'));
      });

      newSession.on('failed', () => {
        setCallStatus('Call Failed');
        setSession(null);
        setIncomingCall(null);
        setCallerName('');
        setCallerNumber('');
        toast.error('Chamada falhou.');
        releaseStream();
      });
    });

    return () => {
      uaRef.current?.stop();
    };
  }, [userData, isReady]);

  useEffect(() => {
    if (prefixesData) {
      setPrefixOptions(prefixesData);
      if (prefixesData.length > 0) {
        setSelectedPrefix(prefixesData[0].number);
      }
    }
  }, [prefixesData]);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.onloadeddata = () => {
        console.log('Dados de áudio carregados.');
      };

      remoteAudioRef.current.onplay = () => {
        console.log('Reprodução de áudio iniciada.');
      };

      remoteAudioRef.current.onerror = (e) => {
        console.error('Erro no elemento de áudio:', e);
      };
    }
  }, [remoteAudioRef]);

  const getUserMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      return stream;
    } catch (error) {
      console.error('Erro ao obter permissão de áudio:', error);
      throw error;
    }
  };

  const releaseStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current && remoteAudioRef.current.srcObject) {
      const remoteStream = remoteAudioRef.current.srcObject as MediaStream;
      remoteStream.getTracks().forEach((track) => track.stop());
      remoteAudioRef.current.srcObject = null;
    }
  };

  const handleCall = async () => {
    if (!numberToCall || !uaRef.current || isCalling) return;
    setIsCalling(true);

    const target = `sip:${selectedPrefix}${numberToCall}@aws-pbx.metronw.com.br`;

    try {
      const stream = await getUserMediaStream();
      localStreamRef.current = stream;

      const options = {
        mediaConstraints: { audio: true, video: false },
        mediaStream: stream,
      };

      const call = uaRef.current.call(target, options);

      // @ts-expect-error: fix later
      setupPeerConnection(call);

      call.on('ended', (e) => {
        toast.info('Chamada encerrada por:' + (e.originator === 'local' ? 'Local' : 'Remoto'));
        setIsCalling(false);
        stream.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      });

      call.on('failed', () => {
        setIsCalling(false);
        stream.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      });
    } catch (error) {
      setIsCalling(false);
    }
  };

  const setupPeerConnection = async (session: RTCSession) => {
    const pc = session.connection;

    console.log(pc)

    if (pc.connectionState === 'connecting' || pc.connectionState === 'connected') {
      return;
    }

    pc.onconnectionstatechange = () => {
      console.log('Estado da conexão:', pc.connectionState);
    };

    try {
      const stream = await getUserMediaStream();
      localStreamRef.current = stream;

      console.log(stream)

      const existingTracks: (MediaStreamTrack | null)[] = pc.getSenders().map((sender: RTCRtpSender) => sender.track);
      if (existingTracks.length === 0) {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      }

      pc.getSenders().forEach((sender: RTCRtpSender) => {
        if (sender.track && sender.track.kind === 'video') {
          pc.removeTrack(sender);
        }
      });

      interface RemoteTrackEvent {
        streams: MediaStream[];
      }

      // @ts-expect-error: fix later
      pc.ontrack = (event: RemoteTrackEvent): void => {
        const [remoteStream]: MediaStream[] = event.streams;
        if (remoteStream && remoteAudioRef.current) {
          // Limpar stream anterior se existir
          if (remoteAudioRef.current.srcObject) {
            const existingStream = remoteAudioRef.current.srcObject as MediaStream;
            existingStream.getTracks().forEach((track) => track.stop());
          }
          remoteAudioRef.current.srcObject = remoteStream;
        }
      };

      setCallStatus("Connected");

      // Extrair trunk_name e callid após a conexão ser estabelecida
      const displayName = session.remote_identity.display_name;
      console.log("Display Name Connected:", displayName); // Adicionado log
      const regex = /^\s*(\S+)\s*\{\s*([^}]+)\s*\}/;
      const match = displayName.match(regex);
      console.log("Regex Match Connected:", match); // Adicionado log
      if (match) {
        const trunk_name = match[1];
        const callid = match[2];
        const callernum = session.remote_identity.uri.user;

        // Chamar a função para criar o ticket
        await createTicket(trunk_name, callid, callernum);
      } else {
        console.warn("Regex não correspondeu para Connected. Display Name:", displayName);
      }

      session.on('ended', () => {
        releaseStream();
      });
    } catch (error) {
      console.error('Erro ao obter permissão de áudio:', error);
    }
  };

  // Função para criar ticket
  const createTicket = async (trunk_name: string, callid: string, callernum: string) => {
    console.log(`createTicket chamada com trunk_name: ${trunk_name}, callid: ${callid}`); // Adicionado log
    try {
      const response = await fetch('/api/phone/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trunk_name, callid, callernum }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Resposta da criação do ticket:", data); // Adicionado log
        const ticket = data.ticket;
        const newTickets = [...ticketContext.tickets, ticket];
        setTicketContext({ ...ticketContext, tickets: newTickets });
        toast.success('Ticket criado com sucesso.');
        router.push(`/agent/triage/${ticket.id}`);
      } else {
        const errorData = await response.json();
        console.error("Erro na resposta da criação do ticket:", errorData); // Adicionado log
        throw new Error(errorData.message || 'Falha ao criar o ticket.');
      }
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      toast.error('Falha ao criar o ticket.');
    }
  };

  const handleAnswerCall = async () => {
    console.log("Handle Answer Call invoked", incomingCall); // Adicionado log
    if (incomingCall) {
      ringAudioRef.current?.pause();
      try {
        const stream = await getUserMediaStream();
        localStreamRef.current = stream;
        const options = {
          mediaConstraints: { audio: true, video: false },
          mediaStream: stream,
        };
        // @ts-expect-error: fix later
        incomingCall.answer(options);
        setupPeerConnection(incomingCall);
        setIncomingCall(null);
        setCallStatus('Connected');
        onCallStatusChange('Connected');
      } catch (error) {
        console.error('Erro ao responder a chamada:', error);
        toast.error('Falha ao responder a chamada.');
      }
    } else {
      console.warn("incomingCall está nulo.");
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      ringAudioRef.current?.pause();
      incomingCall.terminate();
      setIncomingCall(null);
      setCallStatus('Call Ended');
      setCallerName('');
      setCallerNumber('');
    }
  };

  const sendDTMF = (digit: string) => {
    if (session && session.isEstablished()) {
      dialtoneAudioRef.current?.play();
      session.sendDTMF(digit);
      toast.info(`DTMF ${digit} enviado.`);
    } else {
      toast.error('Nenhuma chamada ativa para enviar DTMF.');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  useImperativeHandle(ref, () => ({
    handleAnswerCall,
  }));

  useEffect(() => {
    onCallStatusChange(callStatus);
  }, [callStatus, onCallStatusChange]);

  if (userError || prefixesError) return <div>Error loading data.</div>;
  if (!userData || !prefixesData) return <div>Loading...</div>;

  return (
    <div
      style={{
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: 'auto',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      }}
    >
      {isReady && (
      <>
        <h3 style={{ color: '#000', marginBottom: '15px' }}>WebPhone
          <span style={{ marginLeft: '10px', fontSize: '14px', color: '#555' }}>
            {userData?.sip_extension}
          </span>
        </h3>
        {callStatus !== 'Connected' && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <label style={{ marginRight: '10px', color: '#000', flex: '1' }}>
          Prefixo:
          <select
            value={selectedPrefix}
            onChange={(e) => setSelectedPrefix(e.target.value)}
            style={{
            marginLeft: '5px',
            padding: '5px',
            borderRadius: '4px',
            borderColor: '#ccc',
            color: '#333',
            width: '100%',
            }}
          >
            {prefixOptions.map((prefix) => (
            <option key={prefix.number} value={prefix.number}>
              {prefix.name} ({prefix.number})
            </option>
            ))}
          </select>
          </label>
          <label style={{ marginRight: '10px', color: '#000', flex: '2' }}>
          Número:
          <input
            type="text"
            value={numberToCall}
            onChange={(e) => setNumberToCall(e.target.value)}
            style={{
            marginLeft: '5px',
            padding: '5px',
            borderRadius: '4px',
            borderColor: '#ccc',
            color: '#333',
            width: '100%',
            }}
          />
          </label>
        </div>
        )}
        <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '15px',
        }}
        >
        <button
          onClick={handleCall}
          disabled={isCalling}
          className={`call-button ${isCalling ? 'disabled' : ''}`}
          title="Iniciar Chamada"
          data-tooltip-id="callTooltip"
          style={{
            backgroundColor: '#4caf50', // Green background for better contrast
            color: 'white', // White text
            border: 'none',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          <FiPhoneCall size={20} />
        </button>
        {callStatus === 'Connected' && session && (
          <>
          <button
            onClick={() => {
            session.terminate();
            setSession(null);
            setCallStatus('Call Ended');
            }}
            className="hangup-button"
            title="Encerrar Chamada"
            data-tooltip-id="hangUpTooltip"
            style={{
              backgroundColor: '#f44336', // Red background for better contrast
              color: 'white', // White text
              border: 'none',
              padding: '10px',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            <FiPhoneOff size={20} />
          </button>
          <button 
            onClick={toggleMute}
            style={{
              backgroundColor: isMuted ? "#ff9800" : "#c03e81", //'#ff9800', // Orange background for better contrast
              color: 'white', // White text
              border: 'none',
              padding: '10px',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
          </button>
          </>
        )}
        </div>
        {(isCalling || callStatus === 'Connected') && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Enviar DTMF:</h4>
          <div>
          {['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D'].map((digit) => (
            <button
            key={digit}
            onClick={() => sendDTMF(digit)}
            style={{
              margin: '5px',
              padding: '10px 15px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              backgroundColor: '#333',
              color: 'white',
            }}
            >
            {digit}
            </button>
          ))}
          </div>
        </div>
        )}
        {callStatus === 'Incoming Call' && incomingCall && (
        <div style={{ marginBottom: '15px' }}>
          <p style={{ color: '#000' }}>
          <strong>Chamada de:</strong> {callerName} ({callerNumber})
          </p>
          <button
          onClick={handleAnswerCall}
          style={{
            padding: '10px 20px',
            borderRadius: '5px',
            backgroundColor: '#4caf50',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px',
          }}
          >
          Atender
          </button>
          <button
          onClick={handleRejectCall}
          style={{
            padding: '10px 20px',
            borderRadius: '5px',
            backgroundColor: '#f44336',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
          }}
          >
          Recusar
          </button>
        </div>
        )}
        {callStatus === 'Connected' && (
        <div style={{ marginBottom: '15px' }}>
          <p style={{ color: '#000' }}>
          <strong>Conectado com:</strong> {callerName} ({callerNumber})
          </p>
        </div>
        )}
        <div>
        <strong>Status:</strong> {callStatus}
        </div>
        <audio ref={ringAudioRef} src="/audio/ringtone.wav" />
        <audio ref={answerAudioRef} src="/audio/answer.wav" />
        <audio ref={dialtoneAudioRef} src="/audio/dialtone.wav" />
        <audio ref={hangupAudioRef} src="/audio/hangup.wav" />
        <audio ref={remoteAudioRef} autoPlay controls hidden />
      </>
      )}
    </div>
  );
});

WebPhone.displayName = "WebPhone"

export default WebPhone;