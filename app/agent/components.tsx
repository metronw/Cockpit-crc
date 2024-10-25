'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Accordion, AccordionItem} from "@nextui-org/react"
import {ClockIcon, PlayPauseIcon, ArrowRightStartOnRectangleIcon, HomeIcon} from "@heroicons/react/24/solid"
import Link from "next/link"
import  {redirect, useRouter} from "next/navigation"
import {ICompany, ITicket, useTicketContext} from '@/app/providers'



export const PerformanceChart = () => {
  const data = [{name: 'Dia 1', uv: 400, pv: 2400, amt: 2400}, {name: 'Dia 2', uv: 200, pv: 3000, amt: 2400}, {name: 'Dia 3', uv: 700, pv: 3000, amt: 2400}];
  return(
    <BarChart width={600} height={300} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
      <Bar  dataKey="uv" stroke="#8884d8" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
    </BarChart>
  )
}

export const AgentHeader = () => {
  const router = useRouter()
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  return (
    <div className='grid grid-cols-12'>
      <div className='col-span-3 pl-4'>
      <Button isIconOnly color="primary" aria-label="home" onPress={() => router.push('/agent')}>
        <HomeIcon />
      </Button>
      </div>
      <div className="flex flex-row col-span-8 space-x-4 items-center ">
        <span className="font-bold">Agente - 3650 </span>
        <ClockIcon className="h-10" />
        <div>13:16</div>      
        <Button onPress={onOpen}><PlayPauseIcon className="h-10 text-primary"/></Button>
      </div>
      <Link href="/login"><ArrowRightStartOnRectangleIcon className="col-span-1 h-10 "/></Link>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-black">Pausar</ModalHeader>
              <ModalBody>
                <div className='flex flex-col gap-1 text-black text-lg'>
                  <Button color="primary" className='text-lg'>10 Minutos</Button>
                  <Button color="primary" className='text-lg'>15 Minutos</Button>
                  <Button color="primary" className='text-lg'>Treinamento</Button>
                  <Button color="primary" className='text-lg'>Feedback</Button>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fechar
                </Button>
                <Button color="primary" onPress={onClose}>
                  Pausar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>           
    </div>
  )
}

export const Sidebar = () => {

  let {ticketContext:{tickets, companies}} = useTicketContext()

  interface ICompanyList extends ICompany {
    tickets: Array<ITicket>
  }

  const ticketsList = companies.map<ICompanyList>(el => ({...el, tickets: []}) )
  tickets.forEach(el => {
    let comp = ticketsList.find(item => item.id == el.company_id)
    comp?.tickets.push(el)
  })

  const newTicket = (id:number) => {
    redirect('/agent/triage/')    
  }

  const redirectToTicket = (id:number) => {
    redirect('/agent/triage/'+id)
  }

  return(
    <div className="bg-primary px-2 py-2 text-primary overflow-auto">
      <Accordion isCompact showDivider selectionMode='multiple' itemClasses={{base: 'bg-zinc-100 my-1'}} >
      {
        ticketsList.length > 0 ?
        ticketsList.map(el=> 
          <AccordionItem key={el.name} aria-label={'Accordion ' + el.name} startContent={<CompanyComponent label={el.name} mass={el.mass} count={el.tickets.length}/>}>
            <Client name='+ Novo Atendimento' onClick={() => newTicket(el.id)}/>
            {
              el.tickets?.map(item => 
                <Client name={item.name} timer={item.time} key={item.name} onClick={() => redirectToTicket(item.id)}/>
              )
            }
          </AccordionItem>
        )
        : []
      }

      </Accordion>
    </div>
  )
}

const CompanyComponent = ({label, mass, count}:{label:string, mass:boolean, count:number}) => {
  return(
    <div className="flex flex-row w-full justify-between">
      <div className={"px-2 content-center" + (mass ? " bg-danger mx-1 rounded text-white font-bold" : "")}>{mass ? '!!' : '  '}</div>
      <div className="content-center border bg-success px-2 rounded text-white "><p>{count}</p></div>
      <div className="justify-center px-2 py-1 ">{label}</div>
    </div>
  )
}

const Client = ({name, timer='', onClick}:{name:string, timer?:string, onClick: () => void}) => {
  return(
    <Link href="/agent/triage">
      <div className="flex flex-row align-center rounded space-x-2 shadow-sm shadow-zinc-400 pt-1 mx-2 hover:bg-zinc-400">
        <div className="flex  w-2/12 justify-center  py-1 "></div>
        <div className="flex rounded w-8/12 justify-center py-1  text-sm">{name}</div>
        <div className="flex rounded text-sm px-2">{timer}</div>
      </div>
    </Link>
  )
}


