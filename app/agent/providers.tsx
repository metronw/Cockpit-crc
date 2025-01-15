'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { Ticket } from '@prisma/client';

// const emptyData= {tickets: [], companies:[]}

const testData = {
  tickets:[],
  companies: [
    {id: 1, name: 'ACEM PRIME', mass: true , fantasy_name: ''},
    {id: 2, name: 'INFORMAT', mass: false, fantasy_name: '' },
    {id: 3, name: 'MUVNET', mass: false, fantasy_name: '' },
    {id: 4, name: 'BRPHONIA', mass: false, fantasy_name: '' },
  ]
};

const TicketContext = createContext<ITicketContext>({ticketContext: testData, setTicketContext: ()=> null, isMounted: false});
export const useTicketContext = () => useContext(TicketContext);



export interface IProcedureItemResponse {
  id:number;
  label:string;
  response: string | boolean | number | null;
}

export interface ICompany {
  id: number;
  name: string;
  mass: boolean;
  fantasy_name: string;
}

export interface ILocalData {
  tickets: Array<Ticket>
  companies: Array<ICompany>
}

export interface ITicketContext {
  ticketContext:ILocalData
  setTicketContext: React.Dispatch<React.SetStateAction<{ tickets: Ticket[], companies: ICompany[] }>>;
  isMounted: boolean
}

function mergeContext(local:ILocalData, server: ILocalData){

  const mergedTickets = server.tickets.map((el:Ticket) => {
    const tick = local.tickets.find(item => item.id === el.id)
    return tick ? tick : el
  })
  
  return {tickets: mergedTickets, companies:server.companies}
}


export function TicketProvider({children, iniContext}: { children: React.ReactNode, iniContext: {companies: ICompany[], tickets: Ticket[]} }) {

  const [ticketContext, setTicketContext] = useState<ILocalData>(iniContext)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const savedTickets = localStorage.getItem('tickets');
    setIsMounted(true)
    if (savedTickets) {
      const local = JSON.parse(savedTickets)
      const ctx = (mergeContext(local, ticketContext))
      setTicketContext(ctx);
    }
    
  }, []);

  useEffect(() => {
    if(isMounted){
      localStorage.setItem('tickets', JSON.stringify(ticketContext));
    }
    
  }, [JSON.stringify(ticketContext)]);
  
  // const updateContext = (newContext: ILocalData) => setTicketContextState(newContext)

  return (
    <TicketContext.Provider value={{ticketContext, setTicketContext, isMounted}}>
      {children}
    </TicketContext.Provider>
  );
}