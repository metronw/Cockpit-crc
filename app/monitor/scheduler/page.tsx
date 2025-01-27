import { AssignmentTable, Scheduler } from "./components";

export default function CreateCompany() {

  return (
      <div className="flex flex-col p-2">
        Atribuir Usuários a empresas 
        <Scheduler/>
        
        <AssignmentTable />
      </div>
  );
}