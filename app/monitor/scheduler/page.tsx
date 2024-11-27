import {  getCompaniesList, getUsers } from "@/app/actions/api";
import {use} from 'react'
import { Scheduler } from "./components";

export default function CreateCompany() {
  
  // const types = use(getCrcTicketTypes())
  const companies = use(getCompaniesList())
  const users = use(getUsers())

  return (
    <div className="flex flex-col p-2">
      Atribuir Usuários a empresas
      <Scheduler companies={JSON.parse(companies)} users={JSON.parse(users)} />
      
    </div>
  );
}