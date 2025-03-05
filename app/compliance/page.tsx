// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/authOptions";
import { use } from "react";
import { ComplianceTerm } from "./components";
import { getActiveComplianceTerm } from "../actions/complianceTerm";
import { Compliance_term } from "@prisma/client";


export default function ComplianceTermPage(){
  // const session = use(getServerSession(authOptions));
  const term = use(getActiveComplianceTerm())
  const pageTerm: Compliance_term | null = term.status == 200 ? term.message[0] : null

  return (
    <div>
      {
        pageTerm ?
        <ComplianceTerm term={pageTerm} /> :
        <p>Não foi encontrado Termo ativo</p>
      }
      
    </div>
  );

}