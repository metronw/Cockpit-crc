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

interface IRealTimeContext {
  activeChannels: any[];
  queueChannels: any[];
  waitingCalls: any[];
  connectedCalls: any[];
  isLoading: boolean;
  error: any;
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
  const activeChannels = data?.activeChannels || [];
  const queueChannels = data?.queueChannels || [];
  const waitingCalls = data?.queueLog?.waitingCalls || [];
  const connectedCalls = data?.queueLog?.connectedCalls || [];
  const callerId = data?.activeChannels?.[0]?.calleridnum || '';
  const duration = data?.activeChannels?.[0]?.duration || '';

  return (
    <RealTimeContext.Provider value={{ activeChannels, queueChannels, waitingCalls, connectedCalls, isLoading, error, callerId, duration, mutate }}>
      {children}
    </RealTimeContext.Provider>
  );
}
