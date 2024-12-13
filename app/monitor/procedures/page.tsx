import { InputPicker, ProceduresTable } from "./components";
import { getCrcTicketTypes, getCompaniesList } from "@/app/actions/api";
import {use} from 'react'
import { ProcedureProvider } from "./providers";
import { getAllProcedures } from "@/app/actions/procedures";

export default function CreateCompany() {  
  const types = use(getCrcTicketTypes())
  const companies = use(getCompaniesList())
  const procedures = use(getAllProcedures())

  return (
    <ProcedureProvider companies={JSON.parse(companies)} procedures={procedures}>
      <div className="flex flex-col p-2">
        Criar procedimentos de uma Empresa

        <div>
          <InputPicker companies={JSON.parse(companies)} types={JSON.parse(types)}/>
        </div>
        <ProceduresTable/>
      </div>
    </ProcedureProvider>
  );
}