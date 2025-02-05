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
  id_father: number,
}

export interface ITicketTypeContext {
  fatherTypes: ITicketType[]
  childTypes: ITicketType[]
}

const TicketTypeContext = createContext<ITicketTypeContext|undefined>(undefined); 

export const useTicketTypeContext = () => {
  const ctx = useContext(TicketTypeContext)
  if(!ctx){
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return ctx
};

export function TicketTypeProvider({children, iniContext}: { children: React.ReactNode, iniContext:ITicketTypeContext }) { 

  return (
    <TicketTypeContext.Provider value={iniContext}>
      {children}
    </TicketTypeContext.Provider>
  );
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <CSPostHogProvider>
      <SessionProvider >
        <NextUIProvider>
          {children}
        </NextUIProvider>
      </SessionProvider>
    </CSPostHogProvider>
  )
}
