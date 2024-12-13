'use client'

import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { ICompany } from '@/app/agent/providers';
import { getCompaniesList } from '@/app/actions/api';
import { IProcedure, getAllProcedures } from '@/app/actions/procedures';

interface IProcedureContext {
  procedures: Array<IProcedure>;
  setIsLoadingProceds: Dispatch<SetStateAction<boolean>>
  companies: Array<ICompany>
  setIsLoadingComps: Dispatch<SetStateAction<boolean>>
}

const ProcedureContext = createContext<IProcedureContext|undefined>(undefined); 

export const useProcedureContext = () => {
  const ctx = useContext(ProcedureContext)
  if(!ctx){
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return ctx
};

export function ProcedureProvider({children, companies, procedures}: { children: React.ReactNode, companies: ICompany[], procedures:IProcedure[] }) {

  const [proceds, setProceds] = useState(procedures)
  const [isLoadingProceds, setIsLoadingProceds] = useState(false)

  const [comps, setComps] = useState(companies)
  const [isLoadingComps, setIsLoadingComps] = useState(false)

  useEffect(() => {
    if(isLoadingProceds){
      getAllProcedures().then(resp => {
        setProceds(resp)
        setIsLoadingProceds(false)
      })
    }
  }
  ,[isLoadingProceds])

  useEffect(() => {
    if(isLoadingComps){
      getCompaniesList().then(resp => {
        setComps(JSON.parse(resp))
      })
    }
  }
  ,[isLoadingComps])

  return (
    <ProcedureContext.Provider value={{procedures: proceds, setIsLoadingProceds, companies: comps, setIsLoadingComps}}>
      {children}
    </ProcedureContext.Provider>
  );
}