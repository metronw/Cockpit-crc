import { CompanyGroupCreator, CompanyGroupSelector, TermTable, UploadTerm, UsersTable } from "./components";
import { ManagementProvider } from "./providers";

export default function ManagerDashboard() {
  
  return (
    <ManagementProvider>
      <div className="flex flex-col p-2">
        Dashboard do Gerente        
        <CompanyGroupSelector />
        <CompanyGroupCreator />
      </div>
      <div>
        <UploadTerm/>
        <TermTable/>
        <UsersTable/>
      </div>
    </ManagementProvider>
  );
}