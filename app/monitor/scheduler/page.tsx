import { AssignmentTable, CompanyConfig, Scheduler } from "./components";
import { getCompaniesList } from "@/app/actions/api";
import { Divider } from "@nextui-org/react";
import {use} from 'react'
import { SchedulerProvider } from "./providers";

export default function CreateCompany() {

  const companies = use(getCompaniesList())

  return (
    <SchedulerProvider>
      <div className="flex flex-col p-2">
        <CompanyConfig metroCompanies={companies} />
        <Divider className="my-2" />
        Atribuir Usuários a empresas 
        <Scheduler/>
        
        <AssignmentTable />
      </div>
    </SchedulerProvider>
  );
}