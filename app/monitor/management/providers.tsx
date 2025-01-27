'use client'

import { createContext, useContext, useState,  Dispatch, SetStateAction } from 'react';
import { Company, } from '@prisma/client'
import { ICompanyGroup } from '@/app/actions/company';

interface IManagementContextData  {
  selectedCompany: Company | null
  selectedCompanyGroup: ICompanyGroup | null
}

interface IManagementContext extends IManagementContextData {
  setSelectedCompany: Dispatch<SetStateAction<Company | null>> 
  setSelectedCompanyGroup: Dispatch<SetStateAction<ICompanyGroup | null>> 
}

const ManagementContext = createContext<IManagementContext|undefined>(undefined); 

export const useManagementContext = () => {
  const ctx = useContext(ManagementContext)
  if(!ctx){
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return ctx
};



export function ManagementProvider({children}: { children: React.ReactNode }) {

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)  
  const [selectedCompanyGroup, setSelectedCompanyGroup] = useState<ICompanyGroup | null>(null)  
  

  return (
    <ManagementContext.Provider value={{selectedCompany, setSelectedCompany, selectedCompanyGroup, setSelectedCompanyGroup }}>
      {children}
    </ManagementContext.Provider>
  );
}