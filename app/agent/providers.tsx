'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import {getCompaniesList} from '@/app/actions/api'

const emptyData= {tickets: [], companies:[]}

const testData = {
  tickets:[],
  companies: [
    {id: 1, name: 'ACEM PRIME', mass: true },
    {id: 2, name: 'INFORMAT', mass: false },
    {id: 3, name: 'MUVNET', mass: false },
    {id: 4, name: 'BRPHONIA', mass: false },
  ]
};

const TicketContext = createContext<ITicketContext>({ticketContext: testData, updateContext: ()=> null});
export const useTicketContext = () => useContext(TicketContext);

export interface ITicket {
  id: number;
  client_name: string;
  cpf: string;
  phone: string;
  address: string;
  issue: string;
  status: string;
  user_id: number;
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
  

  const [ticketContext, setTicketContext] = useState<ILocalData>(testData)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {

    const savedTickets = localStorage.getItem('tickets');
    setIsMounted(true)
    if (savedTickets) {
      setTicketContext(JSON.parse(savedTickets));
    }

    return () => {
      if(isMounted){
        localStorage.setItem('tickets', JSON.stringify(ticketContext));
      }
    }
  }, []);

  useEffect(() => {
    if(isMounted){
      localStorage.setItem('tickets', JSON.stringify(ticketContext));
    }
    
  }, [JSON.stringify(ticketContext)]); 
  

  const updateContext = (newContext: ILocalData) => setTicketContext(newContext)

  return (
    <TicketContext.Provider value={{ticketContext, updateContext}}>
      {children}
    </TicketContext.Provider>
  );
}