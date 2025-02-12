import dynamic from 'next/dynamic';
import { TicketWithTime, getTicketsByDate } from '@/app/actions/ticket';
import { use } from 'react';
import { Ticket_time } from '@prisma/client';

const PerformanceChart = dynamic(
  () => import('../components').then((mod)=> mod.PerformanceChart),
  { ssr: false }
)

const startOfDay = new Date();
startOfDay.setHours(0,0,0,0)

const firstDay = new Date()
firstDay.setHours(0,0,0,0);
firstDay.setDate(1)

function getTicketTimeAverage(tickets:TicketWithTime[]){
  const tma = tickets.reduce((total: number, el:TicketWithTime) => total + el.ticket_time.reduce((acc:number, item:Ticket_time) => acc+item.time, 0), 0)/tickets.length
  return tma
}

const formatTime = (time: number) => {
  return `${time/60 < 9 ? '0' + Math.floor(time/60): Math.floor(time/60)}:${time%60 < 10 ? '0'+Math.floor(time%60) : Math.floor(time%60)}`
}

export default function Home() {

  const dailyTickets: TicketWithTime[] | undefined = use(getTicketsByDate(startOfDay))
  const monthlyTickets: TicketWithTime[] | undefined = use(getTicketsByDate(firstDay))  
  
  return (      
    <div className="flex flex-col space-y-4">
      <div className="">
        <DailyPanel tickets={dailyTickets ?? []}/>
      </div>
      <div className="">
        <PerformanceChart tickets={monthlyTickets ?? []}/>
      </div>
      <div className="">
        <MonthlyPanel tickets={monthlyTickets ?? []} />
      </div>
    </div>
  );
}

const MonthlyPanel = ({tickets}:{tickets:TicketWithTime[]}) => {
  const tma = getTicketTimeAverage(tickets)

  return (
    <div className="grid grid-cols-12 w-full gap-2 px-2">
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Produção do Mês</span>
          <span className="font-bold">{tickets.length}</span>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>TMA</span>
          <span className="font-bold">{formatTime(tma)}</span>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Média de Inatividade</span>
          <span className="font-bold">0</span>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Não confirmidades</span>
          <span className="font-bold">0</span>
        </div>
      </div>
    </div>
  )
}


const DailyPanel = ({tickets}:{tickets:TicketWithTime[]}) => {

  const tma = getTicketTimeAverage(tickets)
  const openTicks = tickets.filter(el => el.status != 'closed' && el.status != 'deleted')
  const finishedTicks = tickets.filter(el => el.status == 'closed' )
  const companies = tickets.reduce((acc, el) => acc.includes(el.company_id) ? acc : [...acc, el.company_id] ,[] as number[])

  return (
    <div className="grid grid-cols-12 w-full gap-2 px-2">
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Total empresas</span>
          <span className="font-bold">{companies.length}</span>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Produção Dia</span>
          <div className="grid grid-cols-4">
            <span className="text-sm col-span-2">Corrente</span>
            <span className="text-sm col-span-2">Finalizado</span>
          </div>
          <div className="grid grid-cols-4">
            <span className="col-span-2 font-bold">{openTicks.length}</span>
            <span className="col-span-2 font-bold">{finishedTicks.length}</span>
          </div>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>TMA Dia</span>
          <span className="font-bold">{formatTime(tma)}</span>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Meta do Dia</span>
          <div className="grid grid-cols-4">
            <span className="font-bold col-span-2">0</span>
            <span className="font-bold col-span-2">0%</span>

          </div>
        </div>
      </div>

    </div>
  )
}


