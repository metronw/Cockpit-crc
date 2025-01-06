'use client'

import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { ICompany } from '@/app/agent/providers';
import { getCompaniesList } from '@/app/actions/api';
import { IProcedureItem, getProcedure, IProcedure } from '@/app/actions/procedures';
import { ITIcketType } from '@/app/providers';

interface IProcedureContext {
  procedures: IProcedure;
  setIsLoadingProceds: Dispatch<SetStateAction<boolean>>
  companies: Array<ICompany>
  setIsLoadingComps: Dispatch<SetStateAction<boolean>>
  selectedCompany: number | null;
  setSelectedCompany: Dispatch<SetStateAction<number | null>>
  selectedTicketType: number | null;
  setSelectedTicketType: Dispatch<SetStateAction<number | null>>
  ticketTypes: ITIcketType[];
  setEditProcedure: (id:number) => void;
  selectedProcedure: IProcedureItem | null
}

const ProcedureContext = createContext<IProcedureContext|undefined>(undefined); 

export const useProcedureContext = () => {
  const ctx = useContext(ProcedureContext)
  if(!ctx){
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return ctx
};

export function ProcedureProvider(
  {children, companies=[], procedures, ticketTypes=[]}: 
    { children: React.ReactNode, companies: ICompany[], procedures:IProcedure, ticketTypes: Array<ITIcketType> }
  ) {

  const [proceds, setProceds] = useState(procedures)
  const [isLoadingProceds, setIsLoadingProceds] = useState(false)
  const [selectedProc, setSelectedProc] = useState<IProcedureItem | null>(null)

  const [comps, setComps] = useState(companies)
  const [isLoadingComps, setIsLoadingComps] = useState(false)

  const [selectedCompany, setSelectedCompany] = useState<number | null>(null)
  const [selectedTicketType, setSelectedTicketType] = useState<number | null>(null)

  const setEditProcedure = (id: number) => {
    const proc = proceds.items.find(el => el.id == id)
    proc ? setSelectedProc(proc) : setSelectedProc(null)
  }

  useEffect(() => {
    if(isLoadingProceds){
      getProcedure({company_id: selectedCompany ?? null, ticket_type_id: selectedTicketType ?? 0}).then(resp => {
        setProceds(resp)
        setIsLoadingProceds(false)
      })
    }
  }
  ,[isLoadingProceds, selectedCompany, selectedTicketType])

  useEffect(() => {
    if(isLoadingComps){
      getCompaniesList().then(resp => {
        setComps(JSON.parse(resp))
      })
    }
  }
  ,[isLoadingComps])

  return (
    <ProcedureContext.Provider value={{
      procedures: proceds, setIsLoadingProceds, companies: comps, setIsLoadingComps, 
      selectedCompany, selectedTicketType, setSelectedCompany, setSelectedTicketType, 
      ticketTypes, setEditProcedure, selectedProcedure: selectedProc}}>
      {children}
    </ProcedureContext.Provider>
  );
}