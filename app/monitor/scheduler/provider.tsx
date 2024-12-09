'use client'

import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { IUser, IUserAssign, getUserAssignments } from '@/app/actions/userAssign';
import { ICompany } from '@/app/agent/providers';
import { getCompaniesList } from '@/app/actions/api';

interface ISchedulerContext {
  assignments: Array<IUserAssign>;
  setIsLoadingAssigns: Dispatch<SetStateAction<boolean>>
  companies: Array<ICompany>
  setIsLoadingComps: Dispatch<SetStateAction<boolean>>
  users: Array<IUser>

}

const SchedulerContext = createContext<ISchedulerContext|undefined>(undefined); 
export const useSchedulerContext = () => {
  const ctx = useContext(SchedulerContext)
  if(!ctx){
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return ctx
};

export function SchedulerProvider({children, companies, users, assignments}: { children: React.ReactNode, companies: ICompany[], users: IUser[], assignments:IUserAssign[] }) {

  const [assigns, setAssigns] = useState(assignments)
  const [isLoadingAssigns, setIsLoadingAssigns] = useState(false)

  const [comps, setComps] = useState(companies)
  const [isLoadingComps, setIsLoadingComps] = useState(false)

  useEffect(() => {
    if(isLoadingAssigns){
      getUserAssignments().then(resp => {
        console.log(resp)
        setAssigns(resp)
        setIsLoadingAssigns(false)
      })
    }
  }
  ,[isLoadingAssigns])

  useEffect(() => {
    if(isLoadingComps){
      getCompaniesList().then(resp => {
        setComps(JSON.parse(resp))
      })
    }
  }
  ,[isLoadingComps])

  return (
    <SchedulerContext.Provider value={{assignments: assigns, setIsLoadingAssigns, companies: comps, setIsLoadingComps, users}}>
      {children}
    </SchedulerContext.Provider>
  );
}