'use client'

import { createContext, useContext, useState, useEffect } from 'react';


const MonitorContext = createContext({});
export const useMonitorContext = () => useContext(MonitorContext);

// function mergeContext(local:ILocalData, server: ILocalData){
//   const mergedTickets = local.tickets
//   const mergedCompanies = local.companies

//   server.companies.forEach((el:ICompany) => {
//     if(!local.companies.find(item => item.id === el.id)){
//       mergedCompanies.push(el)
//     }
//   })
  
//   server.tickets.forEach((el:ITicket) => {
//     if(!local.tickets.find(item => item.id === el.id)){
//       mergedTickets.push(el)
//     }
//   })
  
//   return {tickets: mergedTickets, companies:mergedCompanies}
// }


export function MonitorProvider({children, iniContext}: { children: React.ReactNode, iniContext:string }) {

  const [monitorContext, setMonitorContext] = useState(JSON.parse(iniContext))
  const [isMounted, setIsMounted] = useState(false)

  // useEffect(() => {
  //   const savedTickets = localStorage.getItem('tickets');
  //   setIsMounted(true)
  //   if (savedTickets) {
  //     const local = JSON.parse(savedTickets)
  //     const ctx = (mergeContext(local, ticketContext))
  //     setTicketContext(ctx);
  //   }

  // }, []);

  useEffect(() => {
    if(isMounted){
      localStorage.setItem('monitor', JSON.stringify(monitorContext));
    }
    
  }, [JSON.stringify(monitorContext)]);
  
  // const updateContext = (newContext: ILocalData) => setTicketContextState(newContext)

  return (
    <MonitorContext.Provider value={{monitorContext, setMonitorContext, isMounted}}>
      {children}
    </MonitorContext.Provider>
  );
}