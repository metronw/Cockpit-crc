import { AgentHeader, Sidebar} from './components'
import { TicketProvider } from './providers';
import Link from 'next/link';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <TicketProvider>
      <div className='flex flex-col h-screen'>
        <header className="w-full py-3 border-b-2 border-black bg-primary">
            <AgentHeader />        
        </header>
        <main className='grid grid-cols-12 bg-white font-[family-name:var(--font-geist-sans)] text-primary h-full'>
          <div className='col-span-3 bg-primary border-r-1 border-b-1 border-black'>
              <Sidebar />
          </div>
          <div className='col-span-9 bg-white'>
            {children}      
          </div>
        </main>
        <footer className="flex gap-6 flex-wrap items-center justify-center bg-primary py-3">
          <div className='flex flex-col rounded p-4 bg-orange-500'>
            <span>Alerta Massiva!</span>
            <span className='font-bold'>ACEM PRIME</span>
          </div>
        </footer>
      </div>
    </TicketProvider>
  );
}
