'use client'

import { createContext, useContext, useState, useEffect,  Dispatch, SetStateAction } from 'react';
import { IUser, IUserAssign, getUserAssignments } from '@/app/actions/userAssign';
import { getCompaniesList } from '@/app/actions/api';
import { Company } from '@prisma/client'

interface IManagementContextData  {
  companies: Company[];
  users: IUser[];
  assignments: IUserAssign[];
}

interface IManagementContext extends IManagementContextData {
  setCompanies:Dispatch<SetStateAction<Company[]>>;
  setAssignments:Dispatch<SetStateAction<IUserAssign[]>>;
  setIsLoadingAssigns: Dispatch<SetStateAction<boolean>>
  setIsLoadingComps: Dispatch<SetStateAction<boolean>> 
}

const ManagementContext = createContext<IManagementContext|undefined>(undefined); 

export const useManagementContext = () => {
  const ctx = useContext(ManagementContext)
  if(!ctx){
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return ctx
};



export function ManagementProvider({children, iniContext}: { children: React.ReactNode, iniContext:IManagementContextData }) {

  const [assignments, setAssignments] = useState(iniContext.assignments)
  const [isLoadingAssigns, setIsLoadingAssigns] = useState(false)

  const [companies, setCompanies] = useState(iniContext.companies)
  const [isLoadingComps, setIsLoadingComps] = useState(false)
  
  useEffect(() => {
    if(isLoadingComps){
      getCompaniesList().then(resp => {
        setCompanies(resp)
      })
    }
  }
  ,[isLoadingComps])

  return (
    <ManagementContext.Provider value={{companies, setCompanies, assignments, setAssignments, users: iniContext.users, setIsLoadingAssigns, setIsLoadingComps }}>
      {children}
    </ManagementContext.Provider>
  );
}