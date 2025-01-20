'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Accordion, AccordionItem} from "@nextui-org/react"
import {ClockIcon, PlayPauseIcon, ArrowRightStartOnRectangleIcon, HomeIcon, AdjustmentsHorizontalIcon, MinusIcon} from "@heroicons/react/24/solid"
import  { useRouter} from "next/navigation"
import {ICompany, useTicketContext} from '@/app/agent/providers'
import { Ticket } from '@prisma/client';
import { createTicket, updateTicket } from '../actions/ticket';
import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {toast} from 'react-hot-toast';
import useSWR from 'swr';

const fetchPauseStatus = (url: string) => fetch(url).then((res) => res.json());

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

export const AgentHeader = ({id}: {id?: number}) => {

  const router = useRouter()
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const session = useSession()
  const { data: pauseData, error: pauseError, mutate } = useSWR('/api/phone/pauseUser', fetchPauseStatus);
  

  let statusColor = 'red';
  if (pauseError) {
    statusColor = 'red';
  } else if (pauseData?.paused) {
    statusColor = 'orange';
  } else if (pauseData && pauseData.paused === false) {
    statusColor = 'green';
  }

  const handlePause = async (reason: string, onClose: ()=>void) => {
    try {
      const response = await fetch('/api/phone/user', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const userData = await response.json();

      const pauseResponse = await fetch('/api/phone/pauseUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interfaceName: `PJSIP/${userData.sip_extension}`,
          paused: !pauseData.paused,
          reason: reason,
        }),
      });

      const data = await pauseResponse.json();

      if (pauseResponse.ok) {
        toast.success(data.message || 'Estado da interface atualizado com sucesso.');
        mutate('/api/phone/pauseUser');
      } else {
        toast.error(data.error || 'Erro ao atualizar o estado da interface.');
      }
    } catch (error) {
      toast.error('Erro ao alterar o estado da interface.');
    } 
  };

  return (
    <div className='grid grid-cols-12'>
      <div className='flex flex-row gap-4 col-span-3 pl-4'>
        <Button isIconOnly color="primary" aria-label="home" onPress={() => router.push('/agent/'+id)}>
          <HomeIcon />
        </Button>
        {
          session.data?.user.roles.includes('2') || session.data?.user.roles.includes('3') ? 
          <Button isIconOnly color="primary" onPress={() => router.push('/monitor')}>
            <AdjustmentsHorizontalIcon />
          </Button> :
          ''
        }
      </div>
      <div className="flex flex-row col-span-8 space-x-4 items-center ">
        <span className="font-bold">{`${session.data?.user.name}`}</span>
        <ClockIcon className="h-10" />
        <div>00:00</div>      
        <Button onPress={onOpen}><PlayPauseIcon className="h-10 text-primary"/></Button>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: '1px solid #000',
            backgroundColor: statusColor,
            marginLeft: '8px'
          }}
        />
      </div>
      <Button isIconOnly color="primary" aria-label="logout" onPress={() => signOut()}>
      <ArrowRightStartOnRectangleIcon className="col-span-1 h-10 "/>
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-black">
                {pauseData?.paused ? "Despausar" : "Pausar"}
              </ModalHeader>
              <ModalBody>
                <div className='flex flex-col gap-1 text-black text-lg'>
                  {pauseData?.paused ? (
                    <Button
                      color="primary"
                      className='text-lg w-full'
                      onPress={() => handlePause('Despausar', onClose)}
                    >
                      <PlayPauseIcon className="h-10 text-primary" />
                      Despausar
                    </Button>
                  ) : (
                    <>
                      <Button
                        color="primary"
                        className='text-lg'
                        onPress={() => handlePause('10 Minutos', onClose)}
                      >
                        10 Minutos
                      </Button>
                      <Button
                        color="primary"
                        className='text-lg'
                        onPress={() => handlePause('15 Minutos', onClose)}
                      >
                        15 Minutos
                      </Button>
                      <Button
                        color="primary"
                        className='text-lg'
                        onPress={() => handlePause('Treinamento', onClose)}
                      >
                        Treinamento
                      </Button>
                      <Button
                        color="primary"
                        className='text-lg'
                        onPress={() => handlePause('Feedback', onClose)}
                      >
                        Feedback
                      </Button>
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fechar
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

  interface ICompanyList extends ICompany {
    tickets: Array<Ticket>
  }
  const router = useRouter();
  const {ticketContext, setTicketContext, isMounted} = useTicketContext()
  const {tickets, companies} = ticketContext
  const [ticketList, setTicketList] = useState<Array<ICompanyList>>([]) 

  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [modalTick, setModalTick] = useState<Ticket | null>(null)

  const len = tickets.length
  useEffect(()=>{
    refreshList()
  }, [isMounted, len])

  useEffect(() => {
    refreshList()
  }, [JSON.stringify(ticketContext)])

  const refreshList = () => {
    const list = companies.map<ICompanyList>(el => ({...el, tickets: []}))
    const others:ICompanyList = {id:0, name: 'Outros', fantasy_name:'Outros', mass: false,  tickets:[]}
    list.push(others)
    
    tickets.forEach(el => {
      const comp = list.find(item => item.id == el.company_id)
      if(comp){
        comp.tickets.push(el)
      }else{
        others.tickets.push(el)
      }
    })

    setTicketList(list)
  }

  const newTicket = async (company: ICompanyList) => {
    if(tickets.length <= 15){
      const response = await createTicket({company_id: company.id})
      if(response){
        const ticket= JSON.parse(response)
        const newTickets = [...tickets, ticket]
        await setTicketContext({...ticketContext, tickets: newTickets})
        router.push('/agent/triage/'+ticket.id)
      }

    }else{
      toast.error('Só é possível abrir 15 atendimentos simultaneamente')
    }
    
  }

  const closeTicket = async (ticket: Ticket) => {
    const newTicket:Ticket = {...ticket, status:`closed`}
    try{
      await updateTicket({ticket: newTicket})
      toast.success(`ticket id:${ticket.id} foi fechado`)
    }catch(err){
      toast.error(`algo deu errado \n ${err}`)
    }finally{
      setTicketContext({...ticketContext, tickets: ticketContext.tickets.filter(el=> ticket.id != el.id)})

    }
  }

  const redirectToTicket = (id:number) => {
    router.push('/agent/triage/'+id)
  }

  return(
    <div className="bg-primary px-2 py-2 text-primary overflow-auto absolute max-h-full w-full">
      <Accordion isCompact showDivider selectionMode='multiple' itemClasses={{base: 'bg-zinc-100 my-1'}} >
        {
        ticketList.map(el=> 
          <AccordionItem key={el.name} aria-label={'Accordion ' + el.name} startContent={<CompanyComponent label={el.fantasy_name} mass={el.mass} count={el.tickets.length}/>}>
            {
              el.id != 0 ? <Client name='+ Novo Atendimento' onClick={() => newTicket(el)}/> : null
            }
            {
              el.tickets?.map(item => {
                return(
                  <div key={item.id} className='flex flex-row items-center justify-between mx-2'>
                  <Client name={'#'+item.id+`, `+(item.client_name ? item.client_name.substring(0,12) : `sem nome`)} timer={'0:00'}  onClick={() => redirectToTicket(item.id)}/>
                  <Button isIconOnly className='bg-danger content-center' size='sm' radius='md' onPress={() => {onOpen(); setModalTick(item)}}><MinusIcon className='bg-danger w-4'/></Button>
                  </div>
                )
              })
            }
          </AccordionItem>
        )}
      </Accordion>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-black">Fechar Ticket {modalTick?.id}</ModalHeader>
              <ModalBody>
                <p className='text-black'>Todas as informações serão perdidas, tem certeza que deseja continuar?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={() => {onClose(); setModalTick(null)}}>
                  Cancelar
                </Button>
                <Button color="danger" onPress={() => {onClose(); modalTick ? closeTicket(modalTick): null}} >
                  Confirmar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>       
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
      <Button className="flex flex-row align-center rounded space-x-2 shadow-sm shadow-zinc-400 pt-1 mx-2 hover:bg-zinc-400" onPress={onClick}>
        <div className="flex  w-2/12 justify-center  py-1 "></div>
        <div className="flex rounded w-8/12 justify-center py-1  text-sm">{name}</div>
        <div className="flex rounded text-sm px-2">{timer}</div>
      </Button>
  )
}


