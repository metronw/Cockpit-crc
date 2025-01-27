import { InputPicker, ProcedureEditor, ProceduresTable } from "./components";
import {  getCompaniesList } from "@/app/actions/api";
import {use} from 'react'
import { ProcedureProvider } from "./providers";
import { getProcedure } from "@/app/actions/procedures";

export default function Procedures() {  

  const companies = use(getCompaniesList())
  const procedures = use(getProcedure({company_id: null, ticket_type_id: null}))



  return (
    <ProcedureProvider companies={companies} procedures={procedures ?? []} >
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