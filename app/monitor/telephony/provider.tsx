'use client'

import { createContext, useContext } from 'react';
import useSWR from 'swr';

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
