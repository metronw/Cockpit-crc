import {  getCompaniesList, getUsers } from "@/app/actions/api";
import {use} from 'react'
import { AssignmentTable, Scheduler } from "./components";
import { getUserAssignments } from "@/app/actions/userAssign";
import { SchedulerProvider } from "./provider";

export default function CreateCompany() {
  
  const companies = use(getCompaniesList())
  const users = use(getUsers())
  const assignments = use(getUserAssignments())

  return (
    <SchedulerProvider companies={JSON.parse(companies)} users={JSON.parse(users)} assignments={assignments}>
      <div className="flex flex-col p-2">
        Atribuir Usuários a empresas
        <Scheduler/>
        
        <AssignmentTable />
      </div>
    </SchedulerProvider>
  );
}