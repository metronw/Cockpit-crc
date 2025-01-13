'use client'

import { createContext, useContext, useState, useEffect } from 'react';

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

export interface ITicket {
  id: number;
  client_name: string;
  cpf: string;
  phone: string;
  address: string;
  type:string;
  erp: string;
  complement:string;
  status: string;
  user_id: number;
  company_id: number;
  time: string;
  createdAt:Date;
  procedures: string;
  caller_number: string;
  communication_id: string;
  communication_type: string;
  trunk_name: string;
}

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
  tickets: Array<ITicket>
  companies: Array<ICompany>
}

export interface ITicketContext {
  ticketContext:ILocalData
  setTicketContext: React.Dispatch<React.SetStateAction<{ tickets: ITicket[], companies: ICompany[] }>>;
  isMounted: boolean
}

function mergeContext(local:ILocalData, server: ILocalData){
  const mergedTickets = local.tickets
  const mergedCompanies = local.companies

  server.companies.forEach((el:ICompany) => {
    if(!local.companies.find(item => item.id === el.id)){
      mergedCompanies.push(el)
    }
  })
  
  server.tickets.forEach((el:ITicket) => {
    if(!local.tickets.find(item => item.id === el.id)){
      mergedTickets.push(el)
    }
  })
  
  return {tickets: mergedTickets, companies:server.companies}
}


export function TicketProvider({children, iniContext}: { children: React.ReactNode, iniContext:string }) {

  const [ticketContext, setTicketContext] = useState<ILocalData>(JSON.parse(iniContext))
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const savedTickets = localStorage.getItem('tickets');
    setIsMounted(true)
    if (savedTickets) {
      const local = JSON.parse(savedTickets)
      const ctx = (mergeContext(local, ticketContext))
      setTicketContext(ctx);
    }

    // return () => {
    //   if(isMounted){
    //     localStorage.setItem('tickets', JSON.stringify(ticketContext));
    //   }
    // }
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