import { AgentHeader, Sidebar} from './components'
import { TicketProvider } from './providers';
import {use} from 'react'
import {getTicketContext} from '@/app/actions/api'
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/authOptions';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = use(getServerSession(authOptions));
  const iniContext = use(getTicketContext(session?.user.id))

  return (
    <TicketProvider iniContext={iniContext}> 
      <div className='flex flex-col h-screen'>
        <header className="w-full py-3 border-b-2 border-black bg-primary">
            <AgentHeader id={session?.user.id} />        
        </header>
        <main className='grid grid-cols-12 bg-white font-[family-name:var(--font-geist-sans)] text-primary h-full'>
          <div className='col-span-3 bg-primary border-r-1 border-b-1 border-black relative'>
              <Sidebar />
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
    </TicketProvider>
  );
}
