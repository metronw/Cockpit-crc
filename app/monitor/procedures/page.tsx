import { InputPicker, ProcedureEditor, ProceduresTable } from "./components";
import { getCrcTicketTypes, getCompaniesList } from "@/app/actions/api";
import {use} from 'react'
import { ProcedureProvider } from "./providers";
import { getProcedure } from "@/app/actions/procedures";

export default function Procedures() {  

  const types = use(getCrcTicketTypes())
  const companies = use(getCompaniesList())
  const procedures = use(getProcedure({company_id:0, ticket_type_id:0}))

  return (
    <ProcedureProvider companies={JSON.parse(companies)} procedures={procedures} ticketTypes={JSON.parse(types)}>
      <div className="flex flex-col p-2">
        Criar procedimentos de uma Empresa

        <div>
          <InputPicker />
        </div>
        <ProcedureEditor />
        <ProceduresTable/>
      </div>
    </ProcedureProvider>
  );
}