import {  getCompaniesList, getUsers } from "@/app/actions/api";
import {use} from 'react'
import { AssignmentTable, Scheduler } from "./components";
import { getUserAssignments } from "@/app/actions/userAssign";

export default function CreateCompany() {
  
  const companies = use(getCompaniesList())
  const users = use(getUsers())
  const assignments = use(getUserAssignments())

  return (
    <div className="flex flex-col p-2">
      Atribuir Usuários a empresas
      <Scheduler companies={JSON.parse(companies)} users={JSON.parse(users)} />
      
      <AssignmentTable 
      // @ts-expect-error: library has wrong type
      assignments={assignments
      }/>
    </div>
  );
}