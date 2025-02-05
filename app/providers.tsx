'use client';

import {NextUIProvider} from '@nextui-org/react'
import { createContext, useContext} from 'react';
import { SessionProvider } from "next-auth/react";
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
    });
  } else {
    console.error('PostHog key or host is not defined');
  }
}

export interface ITicketType {
  id: number,
  label: string,
}


const TicketTypeContext = createContext({ticketTypeContext: [{id:1, label: 'any'}]});
export const useTicketTypeContext = () => useContext(TicketTypeContext);

export function TicketTypeProvider({children, iniContext}: { children: React.ReactNode, iniContext:Array<ITicketType> }) {

  return (
    <TicketTypeContext.Provider value={{ticketTypeContext: iniContext}}>
      {children}
    </TicketTypeContext.Provider>
  );
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <SessionProvider >
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </SessionProvider>
  )
}
