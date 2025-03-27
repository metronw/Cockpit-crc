"use client";
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import JsSIP from 'jssip';
// import RTCSession from 'jssip/lib/RTCSession';
import useSWR from 'swr';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiPhoneCall, FiPhoneOff, FiMicOff, FiMic, FiPhoneForwarded } from 'react-icons/fi';
import { useRouter } from "next/navigation";
import './WebPhone.css';
import { sendEmail, postToTeams } from '@/app/actions/api';
import { useSession } from 'next-auth/react'

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

const WebPhone = forwardRef<WebPhoneHandle, WebPhoneProps>(({ onCallStatusChange }, ref) => {
  const [rtcSession, setRtcSession] = useState<RTCSession | null>(null);
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
  const [transferNumber, setTransferNumber] = useState('');
  const [showTransferInput, setShowTransferInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sipStatus, setSipStatus] = useState('Disconnected');
  const [audioPermissionDenied, setAudioPermissionDenied] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  const answerAudioRef = useRef<HTMLAudioElement | null>(null);
  const dialtoneAudioRef = useRef<HTMLAudioElement | null>(null);
  const hangupAudioRef = useRef<HTMLAudioElement | null>(null);

  const { data: userData, error: userError } = useSWR('/api/phone/user', fetcher);
  const { data: prefixesData, error: prefixesError } = useSWR('/api/phone/prefix', fetcher);

  const router = useRouter();

  const { data: session, status } = useSession();

  const checkAudioPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setAudioPermissionDenied(false);
    } catch (error) {
      console.log('Erro ao obter permissão de áudio:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setAudioPermissionDenied(true);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(checkAudioPermission, 5000); // Verifica a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

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
      setSipStatus('Connected');
    });

    uaRef.current.on('disconnected', () => {
      console.log('Desconectado do servidor SIP');
      setSipStatus('Disconnected');
    });

    uaRef.current.on('registrationFailed', (e) => {
      console.error('Falha no registro:', e.cause);
      setSipStatus('Registration Failed');
    });

    uaRef.current.on('registered', () => {
      console.log('Registrado no servidor SIP');
      setSipStatus('Registered');
    });

    uaRef.current.on('unregistered', () => {
      console.log('Não registrado no servidor SIP');
      setSipStatus('Unregistered');
    });

    // @ts-expect-error: fix later
    uaRef.current.on('newRTCSession', ({ session }: { RTCSession }) => {
      const newSession: RTCSession = session;
      setRtcSession(newSession);

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
            }, 1000);
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
        setRtcSession(null);
        setIncomingCall(null);
        setCallerName('');
        setCallerNumber('');
        releaseStream();
        setShowTransferInput(false);
        toast.info('Chamada encerrada por: ' + (e.originator === 'local' ? 'Local' : 'Remoto'));
      });

      newSession.on('failed', () => {
        setCallStatus('Call Failed');
        setRtcSession(null);
        setIncomingCall(null);
        setCallerName('');
        setCallerNumber('');
        setShowTransferInput(false);
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
    } finally {
      setIsLoading(false);
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
    if (rtcSession && rtcSession.isEstablished()) {
      dialtoneAudioRef.current?.play();
      rtcSession.sendDTMF(digit);
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

  const handleTransferCall = () => {
    if (rtcSession && rtcSession.isEstablished() && transferNumber) {
      const dtmfSequence = `*1${transferNumber}`;
      for (const digit of dtmfSequence) {
        rtcSession.sendDTMF(digit);
      }
      toast.info(`Transferência iniciada para ${transferNumber}`);
    } else {
      toast.error('Nenhuma chamada ativa para transferir ou número de transferência inválido.');
    }
  };

  const handleShowTransferInput = () => {
    setShowTransferInput(true);
  };

  useImperativeHandle(ref, () => ({
    handleAnswerCall,
  }));

  useEffect(() => {
    onCallStatusChange(callStatus);
  }, [callStatus, onCallStatusChange]);

  const checkLastNotificationTime = () => {
    const lastNotificationTime = localStorage.getItem('lastNotificationTime');
    if (!lastNotificationTime) return true;

    const currentTime = new Date().getTime();
    const timeDifference = currentTime - parseInt(lastNotificationTime, 10);
    return timeDifference > 30 * 60 * 1000; // 30 minutes
  };

  const updateLastNotificationTime = () => {
    const currentTime = new Date().getTime();
    localStorage.setItem('lastNotificationTime', currentTime.toString());
  };

  useEffect(() => {
    const handleAudioPermissionDenied = async () => {
      if (audioPermissionDenied && checkLastNotificationTime()) {
        if (status !== "authenticated") {
          console.error("Usuário não autenticado.");
          return;
        }
        const sessionUser = session?.user;

        console.log("Session User:", sessionUser); // Adicionado log
        const emailData = {
          to: sessionUser.email,
          subject: 'Permissão de áudio negada',
          priority: 'high' as const, // Corrigido para corresponder ao tipo esperado sem usar uma asserção de tipo
          message: `Prezado(a) ${sessionUser.name},

          A permissão de áudio foi negada em sua sessão no Cockpit. É absolutamente necessário que você permita o acesso ao áudio imediatamente para evitar sérios problemas no funcionamento do sistema.

          Esta notificação foi encaminhada à Gestão para conhecimento e está passível de sanções conforme o Manual do Colaborador.`,
          attachments: ''
        };

        const emailDataGestao = {
          to: 'GestoCRC@metronetwork.com.br',
          cc: 'ti@metronetwork.com.br,dev@metronetwork.com.br',
          subject: 'Permissão de áudio negada',
          message: `O usuário ${sessionUser.name} teve a permissão de áudio negada.`,
          attachments: ''
        };

        sendEmail(emailData);
        sendEmail(emailDataGestao);

        const teamsMessage = {
          title: 'Permissão de áudio negada',
          text: `Um usuário negou a permissão de áudio. Mais detalhes encaminhados à Gestão e ao usuário.`,
        };

        postToTeams(teamsMessage);
        updateLastNotificationTime();
      }
    };

    handleAudioPermissionDenied();
  }, [audioPermissionDenied, userData, status, session]);

  if (audioPermissionDenied) {
    return (
      <>
        <div className="audio-permission-denied-background"></div>
        <div className="audio-permission-denied">
          <h1>Permissão de áudio negada</h1>
          <p>Por favor, permita o acesso ao áudio para continuar usando a aplicação.</p>
          {/* TODO: Adicionar mais funcionalidades conforme necessário */}
        </div>
      </>
    );
  }

  if (userError || prefixesError) return <div>Error loading data.</div>;
  if (!userData || !prefixesData) return <div>Loading...</div>;

  return (
    <div className="webphone-container">
      {isReady && (
        <>
          <h3 className="webphone-header">WebPhone
            <span>{userData?.sip_extension}</span>
          </h3>
          <div className="sip-status">
            <strong>SIP Status:</strong> {sipStatus}
          </div>
          {callStatus !== 'Connected' && (
            <div className="webphone-flex">
              <label className="webphone-label" hidden>
                Prefixo:
                <select
                  value={selectedPrefix}
                  onChange={(e) => setSelectedPrefix(e.target.value)}
                  className="webphone-select"
                  hidden
                >
                  {prefixOptions.map((prefix) => (
                    <option key={prefix.number} value={prefix.number}>
                      {prefix.name} ({prefix.number})
                    </option>
                  ))}
                </select>
              </label>
              <label className="webphone-label" hidden>
                Número:
                <input
                  type="text"
                  value={numberToCall}
                  onChange={(e) => setNumberToCall(e.target.value)}
                  className="webphone-input"
                  hidden
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
              hidden
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
            {callStatus === 'Connected' && rtcSession && (
              <>
                <button
                  onClick={() => {
                    rtcSession.terminate();
                    setRtcSession(null);
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
                  disabled
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
                <button
                  onClick={handleShowTransferInput}
                  title="Transferir Chamada"
                  style={{
                    backgroundColor: '#ff9800', // Orange background for better contrast
                    color: 'white', // White text
                    border: 'none',
                    padding: '10px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  <FiPhoneForwarded size={20} />
                </button>
              </>
            )}
          </div>
          {showTransferInput && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <input
                type="text"
                value={transferNumber}
                onChange={(e) => setTransferNumber(e.target.value)}
                placeholder="Número de Transferência"
                style={{
                  flex: 1,
                  padding: '5px',
                  borderRadius: '4px',
                  borderColor: '#ccc',
                  color: '#333',
                }}
              />
              <button
                onClick={handleTransferCall}
                style={{
                  backgroundColor: '#4caf50', // Green background for better contrast
                  color: 'white', // White text
                  border: 'none',
                  padding: '10px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Transferir
              </button>
            </div>
          )}
          {(isCalling || callStatus === 'Connected') && (
            <div className="webphone-status">
              <h4>Enviar DTMF:</h4>
              <div>
                {['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => sendDTMF(digit)}
                    className="webphone-dtmf-button"
                  >
                    {digit}
                  </button>
                ))}
              </div>
            </div>
          )}
          {callStatus === 'Incoming Call' && incomingCall && (
            <div className="webphone-incoming-call">
              <p>
                <strong>Chamada de:</strong> {callerName} ({callerNumber})
              </p>
              <button
                onClick={handleAnswerCall}
                className="answer-button"
              >
                Atender
              </button>
              <button
                onClick={handleRejectCall}
                className="reject-button"
              >
                Recusar
              </button>
            </div>
          )}
          {callStatus === 'Connected' && (
            <div className="webphone-status">
              <p>
                <strong>Conectado com:</strong> {callerName} ({callerNumber})
              </p>
            </div>
          )}
          <div className="webphone-status">
            <strong>Status:</strong> {callStatus}
          </div>
          {isLoading && <div className="loading-overlay">Carregando...</div>}
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