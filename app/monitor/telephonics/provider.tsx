'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import useSWR from 'swr';
import { toast } from 'react-toastify';

export async function fetcher(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Falha ao buscar os dados');
  }
  return response.json();
}

export interface Channel {
  uniqueid: string;
  calleridnum: string;
}

export interface Agent {
  /**
   * ID do usuário (pode ser string, number ou null).
   */
  userId: string | number | null;
  
  /**
   * Nome do agente.
   */
  agentName: string;
  
  /**
   * Interface SIP associada ao agente (ex.: 'PJSIP/4044').
   */
  interface: string;
  
  /**
   * Lista de filas (queues) às quais o agente está associado.
   * Cada fila contém:
   *  - name: nome da fila;
   *  - company_id: identificador da empresa;
   *  - company_fantasy_name: nome fantasia da empresa.
   */
  queues: Array<{
    name: string;
    company_id: number;
    company_fantasy_name: string;
  }>;
  
  /**
   * Indica se o agente está pausado (ou seja, temporariamente indisponível).
   */
  paused: boolean;

  /**
   * Indica qual a pausa ativa do agente (se houver). Caso o agente não esteja pausado, será null.
   */
  pauseReason: string | null;
  
  /**
   * Indica se o agente está em uma chamada no momento.
   */
  inCall: boolean;
  
  /**
   * Indica se o agente está disponível para atender chamadas (ou seja, não está em pausa e não está em chamada).
   */
  available: boolean;
  
  /**
   * Data/hora (ISODate) desde quando o agente está pausado. Caso não esteja pausado, será null.
   */
  pausedSince: string | null;
  
  /**
   * Data/hora (ISODate) desde quando o agente está logado no sistema.
   */
  loggedInSince: string;
  
  /**
   * Indica se a extensão (telefone SIP) do agente está registrada/online.
   */
  extensionOnline: boolean;
  
  /**
   * Latência (em ms) da extensão do agente. Caso a extensão esteja offline, pode ser null.
   */
  extensionLatency: number | null;
}


export interface Call {
  time: string;
  callid: string;
  queuename: string;
  agent: string;
  eventType: string;
  holdTime: string;
  bridgedChannelUniqueId: string;
  ringTime: string;
  company: {
    id: number;
    fantasy_name: string;
  };
  user?: {
    id: number;
    name: string;
  };
}

interface IRealTimeContext {
  activeChannels: Channel[];
  queueChannels: Channel[];
  waitingCalls: Call[];
  connectedCalls: Call[];
  isLoading: boolean;
  error: Error | null;
  callerId: string;
  duration: string;
  mutate: () => void; // Adicionar mutate ao contexto
}

const RealTimeContext = createContext<IRealTimeContext | undefined>(undefined);
export const useRealTimeContext = () => {
  const ctx = useContext(RealTimeContext);
  if (!ctx) {
    throw new Error("useRealTimeContext must be used within a RealTimeProvider");
  }
  return ctx;
};

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
  const { data, error, mutate } = useSWR('/api/phone/calls', fetcher);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (error && !hasError) {
      toast.error('Erro ao carregar dados: ' + error.message);
      setHasError(true);
    }
  }, [error, hasError]);

  const isLoading = !data && !error;
  const activeChannels: Channel[] = data?.activeChannels || [];
  const queueChannels: Channel[] = data?.queueChannels || [];
  const waitingCalls: Call[] = data?.queueLog?.waitingCalls || [];
  const connectedCalls: Call[] = data?.queueLog?.connectedCalls || [];
  const callerId = data?.activeChannels?.[0]?.calleridnum || '';
  const duration = data?.activeChannels?.[0]?.duration || '';

  return (
    <RealTimeContext.Provider value={{ activeChannels, queueChannels, waitingCalls, connectedCalls, isLoading, error, callerId, duration, mutate }}>
      {children}
    </RealTimeContext.Provider>
  );
}
