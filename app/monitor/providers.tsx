'use client'

import { createContext, useContext, useState, useEffect } from 'react';


const MonitorContext = createContext({});
export const useMonitorContext = () => useContext(MonitorContext);


export function MonitorProvider({children, iniContext}: { children: React.ReactNode, iniContext:string }) {

  const [monitorContext, setMonitorContext] = useState(JSON.parse(iniContext))
  const [isMounted] = useState(false)

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