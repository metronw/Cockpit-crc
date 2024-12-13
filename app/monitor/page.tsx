import { getCrcTicketTypes, getCompaniesList } from "@/app/actions/api";
import {use} from 'react'

export default function MonitorDashboard() {
  
  const types = use(getCrcTicketTypes())
  const companies = use(getCompaniesList())
  return (
    <div className="flex flex-col p-2">
      Dashboard do Monitor

    </div>
  );
}