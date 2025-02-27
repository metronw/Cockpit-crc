'use client'

import { createContext, useContext, useState, useEffect,  Dispatch, SetStateAction } from 'react';
import { IUser, IUserAssign, getUserAssignments } from '../actions/userAssign';
import { ICompanyGroup, getAllCompanies, getAllCompanyGroups } from '../actions/company';
import { Company } from '@prisma/client'

interface IMonitorContextData  {
  companies: Company[];
  users: IUser[];
  assignments: IUserAssign[];
  companyGroups: ICompanyGroup[];
}

interface IMonitorContext extends IMonitorContextData {
  setCompanies:Dispatch<SetStateAction<Company[]>>;
  setAssignments:Dispatch<SetStateAction<IUserAssign[]>>;
  setIsLoadingAssigns: Dispatch<SetStateAction<boolean>>
  setIsLoadingComps: Dispatch<SetStateAction<boolean>> 
  setIsLoadingCompanyGroups: Dispatch<SetStateAction<boolean>> 
}

const MonitorContext = createContext<IMonitorContext|undefined>(undefined); 

export const useMonitorContext = () => {
  const ctx = useContext(MonitorContext)
  if(!ctx){
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return ctx
};


export function MonitorProvider({children, iniContext}: { children: React.ReactNode, iniContext:IMonitorContextData }) {

  const [assignments, setAssignments] = useState(iniContext.assignments)
  const [isLoadingAssigns, setIsLoadingAssigns] = useState(false)

  const [companyGroups, setCompanyGroups] = useState(iniContext.companyGroups)
  const [isLoadingcompanyGroups, setIsLoadingCompanyGroups] = useState(false)

  const [companies, setCompanies] = useState(iniContext.companies)
  const [isLoadingComps, setIsLoadingComps] = useState(false)
  

  
  
  useEffect(() => {
    if(isLoadingcompanyGroups){
      getAllCompanyGroups().then(resp => {
        setCompanyGroups(resp)
        setIsLoadingCompanyGroups(false)
      })
    }
  }
  ,[isLoadingcompanyGroups])

  useEffect(() => {
    if(isLoadingAssigns){
      getUserAssignments().then(resp => {
        setAssignments(resp)
        setIsLoadingAssigns(false)
      })
    }
  }
  ,[isLoadingAssigns])

  useEffect(() => {
    if(isLoadingComps){
      getAllCompanies().then(resp => {
        setCompanies(resp)
      })
    }
  }
  ,[isLoadingComps])

  return (
    <MonitorContext.Provider value={{companies, setCompanies, assignments, setAssignments, users: iniContext.users, companyGroups, setIsLoadingCompanyGroups, setIsLoadingAssigns, setIsLoadingComps }}>
      {children}
    </MonitorContext.Provider>
  );
}