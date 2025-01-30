'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { Ticket } from '@prisma/client';
import { Company } from '@prisma/client'
import { getTicketContext } from '../actions/api';
import { useSession } from 'next-auth/react';

// const emptyData= {tickets: [], companies:[]}

const TicketContext = createContext<ITicketContext|undefined>(undefined); 

export const useTicketContext = () => {
  const ctx = useContext(TicketContext)
  if(!ctx){
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return ctx
};


export interface IProcedureItemResponse {
  id:number;
  label:string;
  response: string | boolean | number | null;
}

export interface ITicketContextData {
  tickets: Array<Ticket>
  companies: Array<Company>
}

export interface ITicketContext {
  ticketContext:ITicketContextData
  setTicketContext: React.Dispatch<React.SetStateAction<{ tickets: Ticket[], companies: Company[] }>>;
  isMounted: boolean
}

function mergeContext(local:ITicketContextData, server: ITicketContextData){

  const mergedTickets = server.tickets.map((el:Ticket) => {
    const tick = local.tickets.find(item => item.id === el.id)
    return tick ? tick : el
  })
  
  return {tickets: mergedTickets, companies:server.companies}
}


export function TicketProvider({children, iniContext}: { children: React.ReactNode, iniContext: {companies: Company[], tickets: Ticket[]} }) {

  const [ticketContext, setTicketContext] = useState<ITicketContextData>(iniContext)
  const [isMounted, setIsMounted] = useState(false)
  const session = useSession()

  useEffect(() => {
    setIsMounted(true)

    const revalidate = async () => {
      const ctx: ITicketContextData = await getTicketContext(session?.data?.user.id)
      merge(ctx)
    }
    
    const merge = (context:ITicketContextData) => {
      const savedTickets = localStorage.getItem('tickets');
      if (savedTickets) {
        const local = JSON.parse(savedTickets)
        const ctx = (mergeContext(local, context))
        setTicketContext(ctx);
      }
    }
    
    merge(ticketContext)    
    
    const intervalId = setInterval(revalidate, 10000)
    return () => {
      clearInterval(intervalId);
    };
    
  }, [session]);

  useEffect(() => {
    if(isMounted){
      localStorage.setItem('tickets', JSON.stringify(ticketContext));
    }
    
  }, [JSON.stringify(ticketContext)]);
  
  // const updateContext = (newContext: ITicketContextData) => setTicketContextState(newContext)

  return (
    <TicketContext.Provider value={{ticketContext, setTicketContext, isMounted}}>
      {children}
    </TicketContext.Provider>
  );
}