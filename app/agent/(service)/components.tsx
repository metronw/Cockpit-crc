"use client"

import { Card, CardBody, Autocomplete, AutocompleteItem, RadioGroup, Radio, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Snippet } from "@nextui-org/react";
import Link  from 'next/link'
import { ILocalData, useTicketContext } from "@/app/agent/providers"
import {useState, useEffect, useCallback} from 'react'
import {Input} from "@nextui-org/react"
import {createMetroTicket} from '@/app/actions/api'
import { usePathname, useRouter } from 'next/navigation'

export const TextInput = ({id, fieldName, label}: {id: string, fieldName: 'client_name' | 'phone' | 'cpf' | 'address' | 'erp' | 'complement', label: string}) => {

  const {ticketContext, setTicketContext, isMounted} = useTicketContext()  
  const [value, setValue] = useState<string>('')
  const [debouncedValue, setDebouncedValue] = useState<string>('')
  const [isCtxLoaded, setIsCtxLoaded] = useState<boolean>(false)

  useEffect(()=>{
    if(!isCtxLoaded && isMounted){
      const ticket = ticketContext.tickets.find(el => el.id == parseInt(id))
      const initialValue = ticket ? ticket[fieldName] : ''
      
      setValue(initialValue ?? '')
      setDebouncedValue(initialValue ?? '')
      setIsCtxLoaded(true)
    }
    
  }, [ticketContext.tickets, fieldName,id, isCtxLoaded, isMounted])

  useEffect(()=>{
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 250); // Save only after 250ms of inactivity
    return () => {
      clearTimeout(handler);
    };
  }, [value])

  useEffect(()=>{
    setTicketContext((prevContext) => { 
      const updatedTickets = prevContext.tickets.map((el) =>
        el.id === parseInt(id) ? { ...el, [fieldName]: debouncedValue } : el
      );
      return {...prevContext, tickets: updatedTickets} 
    });
    
  }, [debouncedValue, id, fieldName])
  
  return(    
    <Input
      type="text" 
      label={label} 
      color={'primary'}  
      className={'w-80 h-11 ml-4 border border-primary rounded-medium'}
      value={value}
      onValueChange={setValue}
    />
  )
}

function parsePageInfo(path:string, ticketCtx:ILocalData){
  const pathName = path.split('/')
  const ticketId = parseInt(pathName[pathName.length -1])

  const ticket = ticketCtx.tickets.find(el => el.id == ticketId)
  const company = ticketCtx.companies.find(el => el.id == ticket?.company_id)

  return({company, ticket})
}

export const StagePanel = () => {
  const pathName = usePathname().split('/')
  const stageId = pathName[pathName.length -2]

  let stageName = ''
  switch(stageId){
    case 'triage':
      stageName = 'Triagem'
      break
    case 'procedure':
      stageName = 'Procedimento'
      break
    case 'finish':
      stageName = 'Finalização'
    break
   }

   const {ticketContext} = useTicketContext()
   const path = usePathname()
   const {company, ticket} = parsePageInfo(path, ticketContext)  

  return(
    <div className='col-span-8 bg-white flex flex-row p-2 space-x-4 justify-center'>
        <Card className="border border-primary">
          <CardBody><p className="text-primary">{company?.fantasy_name ?? ''}</p><p className="text-primary">#{ticket?.id ?? ''}</p></CardBody>
        </Card>
        <Card className="border border-primary">
          <CardBody><p className="text-primary">Atendimento Telefônico</p></CardBody>
        </Card>
        <Card className="border border-primary">
          <CardBody>
            <p className="text-center text-primary">Etapa do atendimento:</p> 
            <p className="font-bold text-primary text-center">{stageName.toUpperCase()}</p>
            </CardBody>
        </Card>
        <Card className="border border-primary">
          <CardBody>
            <p className="text-primary text-center">Interação na etapa</p>
            <p className="text-primary text-center">1:48</p>
          </CardBody>
        </Card>
      </div>
  )
}


export const ServiceNavBar = () => {

  const tabs = [
    {
      id: "triage",
      label: "Triagem",
      },
    {
      id: "procedure",
      label: "Procedimento"},
    {
      id: "finish",
      label: "Finalizar"}
  ];

  return(
    <div className='flex flex-row space-x-4 text-lg justify-center bg-zinc-400 py-1  mb-2 '>
      {tabs.map(el => 
        <Link href={'/agent/'+el.id} key={el.id}>
          <Card className=" hover:border hover:border-2 hover:bg-primary border-zinc-700">
            <CardBody><p className="text-primary hover:text-white">{el.label + '  >> '} </p></CardBody>
          </Card>
        </Link>
        )}
    </div>
  )
}

export const IssueSelector = ({id, fieldName, placeholder, dataSource}: {id: string, fieldName: 'type' | 'status', placeholder: string, dataSource:  () => Promise<string> }) => {

  const [items, setItems ] = useState([])
  const {ticketContext, setTicketContext, isMounted} = useTicketContext()
  const ticket = ticketContext.tickets.find(el => el.id == parseInt(id))
  const [value, setValue] = useState<string>(ticket ? ticket[fieldName] ?? '' : '')
  const [isCtxLoaded, setIsCtxLoaded] = useState<boolean>(false)

  useEffect(()=>{
    dataSource().then((data:string) => {
      setItems(JSON.parse(data))
    })
  }, [dataSource])
    
  useEffect(()=>{
    if(isMounted && !isCtxLoaded){
      const ticket = ticketContext.tickets.find(el => el.id == parseInt(id))
      if(ticket){
        setIsCtxLoaded(true)
        setValue((prevState) => prevState == ticket[fieldName] ? prevState : ticket[fieldName] )
      }
    }
  }, [items, fieldName, id, isMounted, isCtxLoaded, ticketContext.tickets])

  
  useEffect(()=>{    
    const newContext = {...ticketContext, tickets: ticketContext.tickets.map(el => el.id == parseInt(id) ? {...el, [fieldName]: value} : el)}
    setTicketContext(newContext)
  }, [value])

  return (
    <Autocomplete
      variant={'bordered'}
      aria-label={placeholder}
      isRequired
      label=""
      defaultItems={items}
      placeholder={placeholder}
      defaultSelectedKey=""
      // @ts-expect-error: library has wrong type
      onSelectionChange={setValue}
      selectedKey={value}
      className="flex h-11 max-w-xs my-1"
      classNames={{
        popoverContent: 'bg-zinc-500 border-primary border rounded-medium',
        base: 'flex shrink border-primary border rounded-medium'
      }}
    >
      {items.map((item:{id:number, label: string}) => <AutocompleteItem key={item.id}>{item.label}</AutocompleteItem>)}
    </Autocomplete>
  );
} 

export const RadioInput = ({isInteractive=false, procedure, Modal }: {isInteractive?: boolean, procedure: string, Modal: React.ReactElement}) => {

  const [response, setResponse] = useState('')
  return(
    <RadioGroup 
      label={procedure} orientation="horizontal" 
      classNames={{label: 'p-1 m-1 rounded ' + (isInteractive ? 'bg-purple-700 text-white' : 'border border-primary text-primary')}}
      value={response}
      onValueChange={setResponse}
    >
      {Modal} 
      <Radio value="Yes" classNames={{ wrapper: 'border-success', control: 'bg-success' }}></Radio>
      <Radio value="No" classNames={{ wrapper: 'border-danger', control: 'bg-danger'}}></Radio>
    </RadioGroup>
  )
}

export const InfoModal = ({title}:{title:string}) => {

  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [scrollBehavior] = useState<"inside" | "normal" | "outside" | undefined >("inside");

  return(
    <div className="flex flex-col gap-2">

      <Button onPress={onOpen}>{title}</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior={scrollBehavior}
        classNames={{body: 'text-black', header: 'text-black'}}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {title}
              </ModalHeader>
              <ModalBody>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
                
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

export const FinishButton = () => {

  const {ticketContext, setTicketContext} = useTicketContext()
  const path = usePathname()
  const { ticket } = parsePageInfo(path, ticketContext)
  const router = useRouter();

  const finishAction = useCallback(async () => {
    const resp = await createMetroTicket(ticket)
    console.log(resp)
    if(resp.status === 200 && ticket){
      const newCtx = {...ticketContext, tickets: ticketContext.tickets.filter(el=> el.id !== ticket.id) }
      setTicketContext(newCtx)
      router.push('/agent/'+ticket.user_id)
    }
  }, [])

  return(
    <Button onPress={finishAction}>
      Finalizar
    </Button>
  )
}

export const TicketSummary = ({userJson}:{userJson:string}) => {
  
  const user = JSON.parse(userJson)
  const {ticketContext} = useTicketContext()
  const path = usePathname()
  const {company, ticket} = parsePageInfo(path, ticketContext)
  
  return(
    <Snippet  size="md" symbol={""} classNames={{base: 'border border-primary px-4 text-priamry py-3'}}>
      <p>Nome de Assinante: {company?.fantasy_name}</p>
      <p>Tipo de atendimento: telefônico </p>
      <p>Nome do solicitante: {ticket?.client_name}</p>
      <p>Endereço: {ticket?.address}</p>
      <p>Problema alegado: </p>
      <p>Procedimentos Realizados</p>
      <p>Data/Horário: {(new Date(ticket?.createdAt ?? '')).toLocaleString()}</p>
      <p>Melhor horário para retorno:</p>
      <p>Telefone: {ticket?.phone}</p>
      <p>Protocolo ERP: {ticket?.erp}</p>
      <p>Protocolo Chat</p>
      <p>Atendente: {user.name} </p>
    </Snippet>
  )
}

