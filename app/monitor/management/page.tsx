import { CompanyGroupCreator, CompanyGroupSelector, TermTable, UploadTerm } from "./components";
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
      </div>
    </ManagementProvider>
  );
}