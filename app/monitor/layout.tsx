import { MonitorHeader, MonitorSidebar } from './components';
import { MonitorProvider } from './providers';
import {  getCompaniesList, getUsers } from "@/app/actions/api";
import {use} from 'react'
import { IUser, IUserAssign, getUserAssignments } from '@/app/actions/userAssign';
import { getAllCompanies } from '../actions/company';


export default function MonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const companies = use(getAllCompanies())
  const users = use(getUsers())
  const assignments = use(getUserAssignments())

  return (
    <MonitorProvider iniContext={{companies, users, assignments}}>
      <div className='flex flex-col h-screen'>
        <header className="w-full py-3 border-b-2 border-black bg-primary">
          <MonitorHeader />
        </header>
        <main className='grid grid-cols-12 bg-white font-[family-name:var(--font-geist-sans)] text-primary h-full'>
          <div className='col-span-3 bg-primary border-r-1 border-b-1 border-black'>
            <MonitorSidebar  />
          </div>
          <div className='col-span-9 bg-white'>
            {children}      
          </div>
        </main>
        <footer className="flex gap-6 flex-wrap items-center justify-center bg-primary py-3">
          {/* <div className='flex flex-col rounded p-4 bg-orange-500'>
            <span>Alerta Massiva!</span>
            <span className='font-bold'>ACEM PRIME</span>
          </div> */}
        </footer>
      </div>
    </MonitorProvider>
  );
}
