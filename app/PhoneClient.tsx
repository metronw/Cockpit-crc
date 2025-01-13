"use client";

import { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import WebPhone from '@/app/components/WebPhone/WebPhone';
import { WebPhoneHandle } from '@/app/components/WebPhone/WebPhoneHandle';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PhoneClient() {
  const { data: userPhone } = useSWR('/api/phone/user', fetcher);
  const [showPhone, setShowPhone] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const webPhoneRef = useRef<WebPhoneHandle>(null);

  useEffect(() => {
    if (userPhone && !userPhone.error) {
      setShowPhone(true);
    }
    if (userPhone && userPhone.error) {
      console.error('Erro ao buscar dados do usuário:', userPhone.error);
      setShowPhone(false);
    } if (userPhone && userPhone.error === 'Usuário não está logado') {
      console.error('Usuário não está logado');
      setShowPhone(false);
    }

  }, [userPhone]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <button
        onClick={() => setShowPhone(!showPhone)}
        style={{
          backgroundColor: showPhone ? "#f44336" : "#4caf50",
          color: "white",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          border: "none",
          cursor: "pointer",
          display: 'block'
        }}
      >
        {showPhone ? "X" : "☎"}
      </button>
      {callStatus === 'Incoming Call' && (
        <button
          onClick={() => webPhoneRef.current?.handleAnswerCall()}
          style={{
            backgroundColor: "#4caf50",
            color: "white",
            borderRadius: "5px",
            padding: "5px 10px",
            marginTop: "8px",
            cursor: "pointer",
          }}
        >
          Atender
        </button>
      )}
      <div
        style={{
          marginTop: "8px",
          display: showPhone ? "block" : "none",
        }}
      >
        <WebPhone ref={webPhoneRef} onCallStatusChange={setCallStatus} />
      </div>
    </div>
  );
}