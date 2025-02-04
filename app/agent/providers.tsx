'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Company } from '@prisma/client'
import { getTicketContext } from '../actions/api';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { TicketWithTime } from '../actions/ticket';

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
  tickets: Array<TicketWithTime>
  companies: Array<Company>
}

export interface ITicketContext {
  ticketContext:ITicketContextData
  setTicketContext: React.Dispatch<React.SetStateAction<ITicketContextData>>;
  isMounted: boolean
}

function mergeContext(local:ITicketContextData, server: ITicketContextData){

  const mergedTickets = server.tickets.map((el:TicketWithTime) => {
    const tick = local.tickets.find(item => item.id === el.id)
    return tick ? tick : el
  })
  
  return {tickets: mergedTickets, companies:server.companies}
}


export function TicketProvider({children, iniContext}: { children: React.ReactNode, iniContext: {companies: Company[], tickets: TicketWithTime[]} }) {

  const [ticketContext, setTicketContext] = useState<ITicketContextData>(iniContext)
  const [isMounted, setIsMounted] = useState(false)
  const session = useSession()
  const path = usePathname()

  const merge = useCallback((context:ITicketContextData) => {
    const savedTickets = localStorage.getItem('tickets');
    if (savedTickets) {
      const local = JSON.parse(savedTickets)
      console.log(local)
      const ctx = (mergeContext(local, context))
      setTicketContext(ctx);
    }
  }, [JSON.stringify(ticketContext)])

  const revalidate = useCallback( async () => {
    const ctx: ITicketContextData = await getTicketContext(session?.data?.user.id)
    merge(ctx)
  }, [session, merge] )

  useEffect(() => {
    setIsMounted(true)   
    
    merge(ticketContext)    
    
    const intervalId = setInterval(revalidate, 10000)
    return () => {
      clearInterval(intervalId);
    };
    
  }, [session]);

  useEffect(() => {
    if(isMounted)
      revalidate()
  }, [path])

  useEffect(() => {
    if(isMounted){
      localStorage.setItem('tickets', JSON.stringify(ticketContext));
    }
    
  }, [JSON.stringify(ticketContext)]);
  

  return (
    <TicketContext.Provider value={{ticketContext, setTicketContext, isMounted}}>
      {children}
    </TicketContext.Provider>
  );
}