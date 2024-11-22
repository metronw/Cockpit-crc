import { InputPicker, RadioInput } from "./components";
import { getCrcTicketTypes, getCompaniesList } from "@/app/actions/api";
import {use} from 'react'

export default function CreateCompany() {
  
  const types = use(getCrcTicketTypes())
  const companies = use(getCompaniesList())
  return (
    <div className="flex flex-col p-2">
      Criar procedimentos de uma Empresa

      <div>
        <InputPicker companies={JSON.parse(companies)} types={JSON.parse(types)}/>
      </div>
    </div>
  );
}