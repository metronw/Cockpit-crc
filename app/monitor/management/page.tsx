import { CompanySelector } from "./components";

export default function ManagerDashboard() {
  
  return (
    <div className="flex flex-col p-2">
      Dashboard do Gerente
      <CompanySelector/>
    </div>
  );
}