"use client";
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import JsSIP from 'jssip';
import useSWR from 'swr';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiPhoneCall, FiPhoneOff } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import './WebPhone.css';

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

interface NewRTCSessionEvent {
  session: JsSIP.RTCSession;
}

interface RTCSessionEndedEvent {
  originator: 'local' | 'remote';
}

interface RTCSessionFailedEvent {
  // Add relevant properties if needed
}

const WebPhone = forwardRef<WebPhoneHandle, WebPhoneProps>(({ onCallStatusChange }, ref) => {
  const [session, setSession] = useState<JsSIP.RTCSession | null>(null);
  const uaRef = useRef<JsSIP.UA | null>(null);
  const [callStatus, setCallStatus] = useState('Idle');
  const [numberToCall, setNumberToCall] = useState('');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [prefixOptions, setPrefixOptions] = useState<PrefixOption[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [incomingCall, setIncomingCall] = useState<JsSIP.RTCSession | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [callerNumber, setCallerNumber] = useState('');

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  const answerAudioRef = useRef<HTMLAudioElement | null>(null);
  const dialtoneAudioRef = useRef<HTMLAudioElement | null>(null);
  const hangupAudioRef = useRef<HTMLAudioElement | null>(null);

  const { data: userData, error: userError } = useSWR('/api/phone/user', fetcher);
  const { data: prefixesData, error: prefixesError } = useSWR('/api/phone/prefix', fetcher);

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
      console.log('Connected to SIP server');
    });

    uaRef.current.on('registrationFailed', (e) => {
      console.error('Registration failed:', e.cause);
    });

    uaRef.current.on('newRTCSession', (e: NewRTCSessionEvent) => {
      const newSession: JsSIP.RTCSession = e.session;
      setSession(newSession);

      if (newSession.direction === 'incoming') {
        const callerNameMatch = newSession.remote_identity.display_name?.match(/^\s*(\S+)\s*\{/);
        setCallerName(callerNameMatch ? callerNameMatch[1] : 'Unknown');
        setCallerNumber(newSession.remote_identity.uri.user || 'Unknown');

        callStatus === 'Incoming Call' && answerAudioRef.current?.play();

        
        console.log("Asterisk Session Variables: ", newSession._request);

        setCallStatus('Incoming Call');
        onCallStatusChange('Incoming Call');

        if (userData.autoanswer === 0) {
          setIncomingCall(newSession);
          if (ringAudioRef.current) {
            ringAudioRef.current.loop = true;
            ringAudioRef.current.play();
          }
        } else {
          newSession.answer({ mediaStream: localStreamRef.current });
          setupPeerConnection(newSession);
        }
      }

      if (newSession.direction === 'outgoing') {
        setCallerName(newSession.remote_identity.display_name || 'Unknown');
        setCallerNumber(newSession.remote_identity.uri.user || 'Unknown');
      }

      newSession.on('ended', (e: RTCSessionEndedEvent) => {
        setCallStatus('Call Ended');
        setSession(null);
        setIncomingCall(null);
        setCallerName('');
        setCallerNumber('');
        releaseStream();
        toast.info('Call ended by: ' + (e.originator === 'local' ? 'Local' : 'Remote'));
      });

      newSession.on('failed', (e: RTCSessionFailedEvent) => {
        setCallStatus('Call Failed');
        setSession(null);
        setIncomingCall(null);
        setCallerName('');
        setCallerNumber('');
        toast.error('Call failed.');
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
        console.log('Audio data loaded.');
      };

      remoteAudioRef.current.onplay = () => {
        console.log('Audio playback started.');
      };

      remoteAudioRef.current.onerror = (e) => {
        console.error('Audio element error:', e);
      };
    }
  }, [remoteAudioRef]);

  const getUserMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      return stream;
    } catch (error) {
      console.error('Error obtaining audio permission:', error);
      throw error;
    }
  };

  const releaseStream = () => {
    [localStreamRef.current, remoteAudioRef.current?.srcObject].forEach((stream) => {
      if (stream) {
        (stream as MediaStream).getTracks().forEach((track) => track.stop());
      }
    });

    if (remoteAudioRef.current) {
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

      setupPeerConnection(call);

      call.on('ended', (e) => {
        toast.info('Call ended by:' + (e.originator === 'local' ? 'Local' : 'Remote'));
        setIsCalling(false);
        stream.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      });

      call.on('failed', (e) => {
        setIsCalling(false);
        stream.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      });
    } catch (error) {
      setIsCalling(false);
    }
  };

  const setupPeerConnection = async (session: JsSIP.RTCSession) => {
    const pc = session.connection;

    if (pc.connectionState === 'connecting' || pc.connectionState === 'connected') {
      return;
    }

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
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

      pc.ontrack = (event: RemoteTrackEvent): void => {
        const [remoteStream]: MediaStream[] = event.streams;
        if (remoteStream && remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      };

      setCallStatus(session.direction === 'incoming' ? 'Incoming Call' : 'Calling');

      session.on('ended', () => {
        releaseStream();
      });
    } catch (error) {
      console.error('Error obtaining audio permission:', error);
    }
  };

  const handleAnswerCall = () => {
    if (incomingCall) {
      ringAudioRef.current?.pause();
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
      toast.info(`DTMF ${digit} sent.`);
    } else {
      toast.error('No active call to send DTMF.');
    }
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
    <div className="webphone-container">
      {isReady && (
        <>
          <h3 className="webphone-title">WebRTC SIP Phone</h3>
          <div className="webphone-input-group">
            <label className="webphone-label">
              Prefix:
              <select
                value={selectedPrefix}
                onChange={(e) => setSelectedPrefix(e.target.value)}
                className="webphone-select"
              >
                {prefixOptions.map((prefix) => (
                  <option key={prefix.number} value={prefix.number}>
                    {prefix.name} ({prefix.number})
                  </option>
                ))}
              </select>
            </label>
            <label className="webphone-label">
              Number:
              <input
                type="text"
                value={numberToCall}
                onChange={(e) => setNumberToCall(e.target.value)}
                className="webphone-input"
              />
            </label>
          </div>
          <div className="webphone-button-group">
            <button
              onClick={handleCall}
              disabled={isCalling}
              className={`call-button ${isCalling ? 'disabled' : ''}`}
              title="Start Call"
              data-tooltip-id="callTooltip"
            >
              <FiPhoneCall size={20} />
            </button>
            {session && (
              <button
                onClick={() => {
                  session.terminate();
                  setSession(null);
                  setCallStatus('Call Ended');
                }}
                className="hangup-button"
                title="End Call"
                data-tooltip-id="hangUpTooltip"
              >
                <FiPhoneOff size={20} />
              </button>
            )}
          </div>
          {isCalling && (
            <div className="webphone-dtmf-group">
              <h4>Send DTMF:</h4>
              <div>
                {['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => sendDTMF(digit)}
                    className="dtmf-button"
                  >
                    {digit}
                  </button>
                ))}
              </div>
            </div>
          )}
          {(incomingCall || (session && callStatus !== 'Idle')) && (
            <div className="webphone-call-info">
              <p>
                <strong>Call from:</strong> {callerName} ({callerNumber})
              </p>
              {incomingCall && (
                <>
                  <button
                    onClick={handleAnswerCall}
                    className="answer-button"
                  >
                    Answer
                  </button>
                  <button
                    onClick={handleRejectCall}
                    className="reject-button"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          )}
          <div>
            <strong>Status:</strong> {callStatus}
          </div>
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