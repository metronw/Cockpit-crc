'use client'

import {NextUIProvider} from '@nextui-org/react'
import {ThemeProvider as NextThemesProvider} from "next-themes";
import { createContext, useContext, useState, useEffect } from 'react';

const emptyData= {tickets: [], companies:[]}

const TicketContext = createContext<ITicketContext>({ticketContext: emptyData, updateContext: ()=> null});
export const useTicketContext = () => useContext(TicketContext);

export interface ITicket {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  address: string;
  issue: string;
  status: string;
  company_id: number;
  time: string;
}

export interface ICompany {
  id: number;
  name: string;
  mass: boolean;
}

export interface ILocalData {
  tickets: Array<ITicket>
  companies: Array<ICompany>
}

export interface ITicketContext {
  ticketContext:ILocalData
  updateContext:(newContext: ILocalData)=>void
}


export function TicketProvider({children}: { children: React.ReactNode }) {
  // const [ticketContext, setTicketContext] = useState<ILocalData>({
  //   tickets:[
  //     {id: 1, name: 'José Alves', time: '1:57', company_id:1}
  //   ],
  //   companies: [
  //     {id: 1, name: 'ACEM PRIME', mass: true },
  //     {id: 2, name: 'INFORMAT', mass: false },
  //     {id: 3, name: 'MUVNET', mass: false },
  //     {id: 4, name: 'BRPHONIA', mass: false },
  //   ]
  // });

  const savedData = JSON.parse(localStorage.getItem('tickets') ?? '')

  const [ticketContext, setTicketContext] = useState<ILocalData>(savedData);

  useEffect(() => {
    const savedTickets = localStorage.getItem('tickets');
    if (savedTickets) {
      setTicketContext(JSON.parse(savedTickets));
    }

    // return () => {
    //   localStorage.setItem('tickets', JSON.stringify(ticketContext));
    // }
  }, []);

  
  useEffect(() => {
    if (ticketContext && JSON.stringify(ticketContext) != JSON.stringify(emptyData)) {
      localStorage.setItem('tickets', JSON.stringify(ticketContext));
    }
  }, [ticketContext]);

  const updateContext = (newContext: ILocalData) => setTicketContext(newContext)

  return (
    <TicketContext.Provider value={{ticketContext, updateContext}}>
      {children}
    </TicketContext.Provider>
  );
}


export function Providers({children}: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="light">
        <TicketProvider>
          {children}
        </TicketProvider>
      </NextThemesProvider>
    </NextUIProvider>
  )
}