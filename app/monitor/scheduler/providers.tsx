'use client'

import { createContext, useContext, useState, Dispatch, SetStateAction } from 'react';
import { Company } from '@prisma/client'
import { IUser } from '@/app/actions/userAssign';

interface ISchedulerContext {
  setSelectedUser: Dispatch<SetStateAction<IUser | undefined>>
  selectedUser: IUser | undefined
  selectedCompany: Company | undefined
  setSelectedCompany: Dispatch<SetStateAction<Company | undefined>>

}

const SchedulerContext = createContext<ISchedulerContext|undefined>(undefined); 

export const useSchedulerContext = () => {
  const ctx = useContext(SchedulerContext)
  if(!ctx){
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return ctx
};

export function SchedulerProvider(  {children }: { children: React.ReactNode }) {

    const [selectedUser, setSelectedUser] =  useState<IUser>() 
    const [selectedCompany, setSelectedCompany] =  useState<Company>() 

  return (
    <SchedulerContext.Provider value={{selectedUser, setSelectedUser, selectedCompany, setSelectedCompany}}>
      {children}
    </SchedulerContext.Provider>
  );
}