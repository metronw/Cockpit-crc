'use client'

import {NextUIProvider} from '@nextui-org/react'
import { createContext, useContext} from 'react';
import { SessionProvider } from "next-auth/react";

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

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <SessionProvider >
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </SessionProvider>
  )
}