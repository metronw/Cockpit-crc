
"use client";

import { useEffect, useRef, useState } from 'react';
import JsSIP from 'jssip';
import useSWR from 'swr';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiPhoneCall, FiPhoneOff } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const WebPhone = () => {
  const [session, setSession] = useState<JsSIP.RTCSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const uaRef = useRef<JsSIP.UA | null>(null);

  const { data: config } = useSWR('/api/sip-config', fetcher);

  useEffect(() => {
    if (config) {
      const socket = new JsSIP.WebSocketInterface(config.websocket);
      const configuration = {
        sockets: [socket],
        uri: config.uri,
        password: config.password,
      };

      const ua = new JsSIP.UA(configuration);
      uaRef.current = ua;

      ua.on('connected', () => {
        setIsConnected(true);
        toast.success('Connected to SIP server');
      });

      ua.on('disconnected', () => {
        setIsConnected(false);
        toast.error('Disconnected from SIP server');
      });

    interface NewRTCSessionData {
        session: JsSIP.RTCSession;
    }

    ua.on('newRTCSession', (data: NewRTCSessionData) => {
        const newSession = data.session;
        setSession(newSession);

        newSession.on('ended', () => {
            setSession(null);
            setIsCalling(false);
            toast.info('Call ended');
        });

        newSession.on('failed', () => {
            setSession(null);
            setIsCalling(false);
            toast.error('Call failed');
        });

        newSession.on('accepted', () => {
            setIsCalling(true);
            toast.success('Call accepted');
        });
    });

      ua.start();
    }
  }, [config]);

  const handleCall = (target: string) => {
    if (uaRef.current) {
      const eventHandlers = {
        progress: () => {
          toast.info('Call is in progress');
        },
        failed: () => {
          toast.error('Call failed');
        },
        ended: () => {
          toast.info('Call ended');
        },
        confirmed: () => {
          toast.success('Call confirmed');
        },
      };

      const options = {
        eventHandlers,
        mediaConstraints: { audio: true, video: false },
      };

      uaRef.current.call(target, options);
    }
  };

  const handleHangup = () => {
    if (session) {
      session.terminate();
    }
  };

  return (
    <div>
      <ToastContainer />
      <Tooltip id="phone-tooltip" />
      <button
        aria-label="Call"
        onClick={() => handleCall('sip:target@sipserver.com')}
        disabled={isCalling}
        data-tooltip-id="phone-tooltip"
        data-tooltip-content="Call"
        title="Call"
      >
        <FiPhoneCall />
      <button
        aria-label="Hangup"
        onClick={handleHangup}
        disabled={!isCalling}
        data-tooltip-id="phone-tooltip"
        data-tooltip-content="Hangup"
      >
        <FiPhoneOff />
      </button>
      </button>
    </div>
  );
};

export default WebPhone;