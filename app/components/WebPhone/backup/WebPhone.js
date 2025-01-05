"use client";
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import JsSIP from 'jssip';
import useSWR from 'swr';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiPhoneCall, FiPhoneOff } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';

JsSIP.debug.enable(false);

const fetcher = (url) => fetch(url).then((res) => res.json());

const WebPhone = forwardRef(({ onCallStatusChange }, ref) => {
    const [session, setSession] = useState(null);
    const uaRef = useRef(null);
    const [callStatus, setCallStatus] = useState('Idle');
    const [numberToCall, setNumberToCall] = useState('');
    const [selectedPrefix, setSelectedPrefix] = useState('');
    const [prefixOptions, setPrefixOptions] = useState([]);
    const [isReady, setIsReady] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [isCalling, setIsCalling] = useState(false); // Adicionado estado para controlar chamadas ativas
    const [callerName, setCallerName] = useState('');
    const [callerNumber, setCallerNumber] = useState('');

    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const ringAudioRef = useRef(null); // Adicionado: Referência para o áudio do toque
    const answerAudioRef = useRef(null); // Adicionado: Referência para o áudio de atendimento
    const dialtoneAudioRef = useRef(null); // Adicionado: Referência para o áudio do tom de discagem
    const hangupAudioRef = useRef(null); // Adicionado: Referência para o áudio de desligamento


    const { data: userData, error: userError } = useSWR('/api/phone/user', fetcher);
    const { data: prefixesData, error: prefixesError } = useSWR('/api/phone/prefix', fetcher);

    useEffect(() => {
        if (!userData) return;
        if (!userData.error) {
          setIsReady(true); // Registrar automaticamente
        }
    }, [userData]);

    useEffect(() => {
        if (!userData || !isReady) return;


        // Configuração do JsSIP UserAgent usando dados do banco de dados
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

        // Modificado: Eventos 'ended' e 'failed' das sessões para chamar releaseStream
        uaRef.current.on('newRTCSession', (e) => {
            // check if there is already a session and if it is incoming

            console.log(callStatus);

            const newSession = e.session;
            setSession(newSession);

            console.log('Nova sessão:', newSession);
            console.log('Direção da chamada:', newSession.direction);

            if (newSession.direction === 'incoming') {

                setCallerName(newSession._remote_identity._display_name || 'Desconhecido');
                setCallerNumber(newSession._remote_identity._uri.user || 'Desconhecido');

                callStatus === 'Incoming Call' && answerAudioRef.current.play(); // Tocar som de atendimento
                
                console.log('Chamada recebida de:', newSession._remote_identity._display_name, newSession._remote_identity._uri.user);
                
                setCallStatus('Incoming Call');
                onCallStatusChange('Incoming Call');

                if (userData.autoanswer) {
                    newSession.answer({ mediaStream: localStreamRef.current });
                    setupPeerConnection(newSession);
                } else {
                    setIncomingCall(newSession);
                    // Iniciar toque de chamada
                    ringAudioRef.current.loop = true; // Repetir o toque
                    ringAudioRef.current.play(); // Tocar o toque
                }
            } 

            if (newSession.direction === 'outgoing') {
                // setupPeerConnection(newSession);
                setCallerName(newSession._remote_identity._display_name || 'Desconhecido');
                setCallerNumber(newSession._remote_identity._uri.user || 'Desconhecido');
            }

            newSession.on('ended', (e) => {
                setCallStatus('Call Ended');
                setSession(null);
                setIncomingCall(null);
                setCallerName('');
                setCallerNumber('');
                releaseStream();
                 toast.info('Chamada encerrada por:' + (e.originator === 'local' ? 'Local' : 'Remoto'));
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

            console.log('Sessão respondida.', newSession);
        });

        return () => {
            uaRef.current.stop();
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

    // Adicionar useEffect para monitorar remoteAudioRef
    useEffect(() => {
        if (remoteAudioRef.current) {
            console.log('Elemento de áudio disponível:', remoteAudioRef.current);

            // Listener para evento de carregamento de dados
            remoteAudioRef.current.onloadeddata = () => {
                console.log('Dados de áudio carregados.');
            };

            // Listener para início da reprodução
            remoteAudioRef.current.onplay = () => {
                console.log('Reprodução de áudio iniciada.');
            };

            // Listener para erros de áudio
            remoteAudioRef.current.onerror = (e) => {
                console.error('Erro no elemento de áudio:', e);
            };
        } else {
            console.log('remoteAudioRef.current é nulo');
        }
    }, [remoteAudioRef]);

    // Adicionado: Função reutilizável para obter user media
    const getUserMediaStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            return stream;
        } catch (error) {
            console.error('Erro ao obter permissão de áudio:', error);
            throw error;
        }
    };

    // Adicionado: Função para liberar streams de mídia
    const releaseStream = () => {
        [localStreamRef.current, remoteAudioRef.current?.srcObject].forEach(stream => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        });

        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }

        // localStreamRef.current = null;
    };

    // Modificado: handleCall para incluir restrições de mídia
    const handleCall = async () => {
        if (!numberToCall || !uaRef.current || isCalling) return;
        setIsCalling(true); // Bloquear chamadas adicionais

        const target = `sip:${selectedPrefix}${numberToCall}@aws-pbx.metronw.com.br`;

        try {
            const stream = await getUserMediaStream();
            localStreamRef.current = stream;

            console.log('Stream local:', stream);

            // Adicionar restrições de mídia para áudio apenas
            const options = {
                mediaConstraints: { audio: true, video: false },
                mediaStream: stream,
            };

            const call = uaRef.current.call(target, options);

            console.log('Chamada iniciada:', call);

            setupPeerConnection(call);

            call.on('ended', (e) => {
                console.log('Chamada encerrada por:', e.cause);
                toast.info('Chamada encerrada por:' + (e.originator === 'local' ? 'Local' : 'Remoto'));
                setIsCalling(false); // Liberar botão após término da chamada
                // Limpar media
                stream.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            });

            call.on('failed', (e) => {
                console.log('Chamada falhou por:', JSON.stringify(e.cause));
                setIsCalling(false); // Liberar botão em caso de falha
                // Limpar media
                stream.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            });
        } catch (error) {
            setIsCalling(false); // Liberar botão em caso de erro
        }
    };

    // Modificado: setupPeerConnection para incluir restrições de mídia
    const setupPeerConnection = async (session) => {
        const pc = session.connection;

        console.log('PeerConnection:', pc);

        console.log('Estado da conexão:', pc.connectionState);

        if (pc.connectionState === 'connecting' || pc.connectionState === 'connected') {
            console.log('PeerConnection já conectado.');
            return;
        }

        pc.onconnectionstatechange = () => {
            console.log('Estado da conexão:', pc.connectionState);
        };

        try {
            const stream = await getUserMediaStream();
            localStreamRef.current = stream;

            // Adicionar tracks locais ao PeerConnection somente se não estiverem adicionados
            const existingTracks = pc.getSenders().map(sender => sender.track);
            console.log('Tracks existentes:', existingTracks);
            if (existingTracks.length === 0) {
                stream.getTracks().forEach((track) => {
                    console.log('Adicionando track ao PeerConnection:', track);
                    pc.addTrack(track, stream);
                });
            }else {
                console.log('Track já adicionada ao PeerConnection:', existingTracks);
            }

            // Remover quaisquer tracks de vídeo existentes
            pc.getSenders().forEach(sender => {
                if (sender.track && sender.track.kind === 'video') {
                    console.log('Removendo track de vídeo:', sender.track);
                    pc.removeTrack(sender);
                }
            });

            // Listener para tracks remotas
            pc.ontrack = (event) => {
                console.log('Track recebida:', event.track);
                const [remoteStream] = event.streams;
                if (remoteStream && remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = remoteStream;
                    console.log('Stream remota atribuída ao elemento de áudio.');
                } else {
                    console.log('remoteStream ou remoteAudioRef.current não disponível.');
                }
            };

            setCallStatus(session.direction === 'incoming' ? 'Incoming Call' : 'Calling');

            // Limpeza após a chamada
            session.on('ended', () => {
                releaseStream();
            });

        } catch (error) {
            console.error('Erro ao obter permissão de áudio:', error);
        }
    };

    // Modificado: handleAnswerCall para incluir restrições de mídia ao responder
    const handleAnswerCall = () => {
        if (incomingCall) {
            ringAudioRef.current.pause(); // Parar o toque
            const options = {
                mediaConstraints: { audio: true, video: false },
                mediaStream: localStreamRef.current,
            };
            incomingCall.answer(options);
            setupPeerConnection(incomingCall);
            setIncomingCall(null);
            setCallStatus('Connected');
            onCallStatusChange('Connected');
        }
    };

    // Modificado: handleRejectCall para chamar releaseStream
    const handleRejectCall = () => {
        if (incomingCall) {
            ringAudioRef.current.pause(); // Parar o toque

            incomingCall.terminate();
            setIncomingCall(null);
            setCallStatus('Call Ended');
            setCallerName('');
            setCallerNumber('');
        }
    };

    const sendDTMF = (digit) => {
        if (session && session.isEstablished()) {
            dialtoneAudioRef.current.play(); // Tocar tom de discagem
            session.sendDTMF(digit);
            toast.info(`DTMF ${digit} enviado.`);
        } else {
            toast.error('Nenhuma chamada ativa para enviar DTMF.');
        }
    };

    useImperativeHandle(ref, () => ({
        handleAnswerCall,
    }));

    useEffect(() => {
        // Atualizar o status da chamada sempre que ele mudar
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
                    <h3 style={{ color: '#333', marginBottom: '15px' }}>WebRTC SIP Phone</h3>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ marginRight: '10px', color: '#333' }}>
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
                                }}
                            >
                                {prefixOptions.map((prefix) => (
                                    <option key={prefix.number} value={prefix.number}>
                                        {prefix.name} ({prefix.number})
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label style={{ marginRight: '10px', color: '#333' }}>
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
                                }}
                            />
                        </label>
                    </div>
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
                            disabled={isCalling} // Bloquear botão quando estiver chamando
                            style={{
                                padding: '10px',
                                borderRadius: '50%',
                                backgroundColor: isCalling ? '#9e9e9e' : '#4caf50', // Alterar cor quando bloqueado
                                border: 'none',
                                color: 'white',
                                cursor: isCalling ? 'not-allowed' : 'pointer',
                            }}
                            data-tooltip-id="callTooltip"
                        >
                            <FiPhoneCall size={20} />
                        </button>
                        <Tooltip id="callTooltip" place="top" effect="solid">
                            Iniciar Chamada
                        </Tooltip>
                        {session && (
                            <>
                                <button
                                    onClick={() => {
                                        session.terminate();
                                        setSession(null);
                                        setCallStatus('Call Ended');
                                        //toast.info('Chamada encerrada.');
                                    }}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: '#f44336',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                    }}
                                    data-tooltip-id="hangUpTooltip"
                                >
                                    <FiPhoneOff size={20} />
                                </button>
                                <Tooltip id="hangUpTooltip" place="top" effect="solid">
                                    Encerrar Chamada
                                </Tooltip>
                            </>
                        )}
                    </div>
                    {isCalling && (
                        <div style={{ marginBottom: '15px' }}>
                            <h4>Enviar DTMF:</h4>
                            <div>
                                {['1','2','3','A','4','5','6','B','7','8','9','C','*','0','#','D'].map(digit => (
                                    <button
                                        key={digit}
                                        onClick={() => sendDTMF(digit)}
                                        style={{
                                            margin: '5px',
                                            padding: '10px 15px',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc',
                                            cursor: 'pointer',
                                            backgroundColor: '#333', // Background color
                                            color: 'white', // Text color for contrast
                                        }}
                                    >
                                        {digit}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {(incomingCall || (session && callStatus !== 'Idle')) && (
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{color: 'black'}}><strong>Chamada de:</strong> {callerName} ({callerNumber})</p>
                            {incomingCall && (
                                <>
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
                                </>
                            )}
                        </div>
                    )}
                    <div>
                        <strong>Status:</strong> {callStatus}
                    </div>
                    {/* Adicionado: Elemento de áudio para o toque */}
                    <audio ref={ringAudioRef} src="/audio/ringtone.wav" />
                    <audio ref={answerAudioRef} src="/audio/answer.wav" />
                    <audio ref={dialtoneAudioRef} src="/audio/dialtone.wav" />
                    <audio ref={hangupAudioRef} src="/audio/hangup.wav" />
                    <audio ref={remoteAudioRef} autoPlay controls />
                </>
            )}
        </div>
    );
});

export default WebPhone;
