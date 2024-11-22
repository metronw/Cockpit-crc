'use client'

import {NextUIProvider} from '@nextui-org/react'
import { createContext, useContext} from 'react';

const TicketTypeContext = createContext({ticketTypeContext: [{id:'1', label: 'any'}]});
export const useTicketTypeContext = () => useContext(TicketTypeContext);

export function TicketTypeProvider({children, iniContext}: { children: React.ReactNode, iniContext:Array<any> }) {

  return (
    <TicketTypeContext.Provider value={{ticketTypeContext: iniContext}}>
      {children}
    </TicketTypeContext.Provider>
  );
}

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  )
}