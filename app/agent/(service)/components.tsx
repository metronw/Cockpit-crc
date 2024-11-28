"use client"

import { Card, CardBody, Autocomplete, AutocompleteItem, RadioGroup, Radio, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Snippet } from "@nextui-org/react";
import Link  from 'next/link'
import { ILocalData, IProcedureItem, useTicketContext } from "@/app/agent/providers"
import {useState, useEffect, useCallback} from 'react'
import {Input} from "@nextui-org/react"
import {createMetroTicket} from '@/app/actions/api'
import { usePathname, useRouter } from 'next/navigation'
import { getProcedures } from "@/app/actions/procedures";
import { useTicketTypeContext } from "@/app/providers";
import { useSession } from "next-auth/react";

export const TextInput = ({id, fieldName, label, isRequired=false}: {id: string, fieldName: 'client_name' | 'phone' | 'cpf' | 'address' | 'erp' | 'complement', label: string, isRequired?: boolean}) => {

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
      isRequired= {isRequired}
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
          <CardBody><p className="text-primary">{company?.fantasy_name ?? ''}</p><p className="text-primary text-center font-bold">Ticket #{ticket?.id ?? ''}</p></CardBody>
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

export const IssueSelector = ({id, fieldName, placeholder, dataSource, isRequired}: {id: string, fieldName: 'type' | 'status', placeholder: string, dataSource:  () => Promise<string>, isRequired: boolean }) => {

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
      isRequired={isRequired}
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

export const RadioInput = ({isInteractive=false, label, Modal, id= 0 }: {isInteractive?: boolean, label: string, Modal: React.ReactElement, id: number}) => {

  const {ticketContext, setTicketContext} = useTicketContext()
  const path = usePathname()
  const { ticket } = parsePageInfo(path, ticketContext)
  const [response, setResponse] = useState('')

  useEffect(()=>{
    if(ticket){
      const procedures = JSON.parse(ticket.procedures)
      const procedure = procedures.find((el:IProcedureItem) => el.id == id)
      procedure?.response ? setResponse(procedure.response) : null
    }

  }, [])

  useEffect(() => {
    if(ticket){
      let procedures = JSON.parse(ticket.procedures)
      if(procedures.find((el:IProcedureItem) => el.id == id)){
        procedures = procedures.map((el:IProcedureItem) => el.id == id ? {...el, response} : el  )
      }else{
        procedures.push({id, response, label})
      }
      const newTicket = ticketContext.tickets.map(el => el.id == ticket.id ? {...el, procedures: JSON.stringify(procedures)} : el)
      setTicketContext({...ticketContext, tickets:newTicket})
    }
  }, [response])


  return(
    <RadioGroup 
      label={label} orientation="horizontal" 
      classNames={{label: 'p-1 m-1 rounded ' + (isInteractive ? 'bg-purple-700 text-white' : 'border border-primary text-primary')}}
      value={response}
      onValueChange={setResponse}
    >
      {Modal} 
      <Radio value="true" classNames={{ wrapper: 'border-success', control: 'bg-success' }}></Radio>
      <Radio value="false" classNames={{ wrapper: 'border-danger', control: 'bg-danger'}}></Radio>
    </RadioGroup>
  )
}

export const InfoModal = ({title, body}:{title:string, body:string}) => {

  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [scrollBehavior] = useState<"inside" | "normal" | "outside" | undefined >("inside");

  return(
    <div className="flex flex-col gap-2">

      <Button onPress={onOpen}>{'Instrução'}</Button>
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
                {body}
                
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

export const TicketSummary = () => {
  
  const {ticketContext} = useTicketContext()
  const {ticketTypeContext} = useTicketTypeContext()
  const path = usePathname()
  const {company, ticket} = parsePageInfo(path, ticketContext)
  const session = useSession()
  
  
  return(
    <Snippet  size="md" symbol={""} classNames={{base: 'border border-primary px-4 text-priamry py-3'}}>
      <p>Nome de Assinante: {company?.fantasy_name}</p>
      <p>Tipo de atendimento: </p>
      <p>Nome do solicitante: {ticket?.client_name}</p>
      <p>Endereço: {ticket?.address}</p>
      <p>Problema alegado: {ticketTypeContext.find(el => el.id == ticket?.type)?.label} </p>
      <p>Procedimentos Realizados:</p>
      <p>Data/Horário: {(new Date(ticket?.createdAt ?? '')).toLocaleString()}</p>
      <p>Melhor horário para retorno:</p>
      <p>Telefone: {ticket?.phone}</p>
      <p>Protocolo ERP: {ticket?.erp}</p>
      <p>Protocolo Chat</p>
      <p>Atendente: {session?.data?.user.name} </p>
    </Snippet>
  )
}


export const Procedures = () =>{
  const {ticketContext} = useTicketContext()
  const [procedures, setProcedures] = useState<Array<any>| null>(null)

  const path = usePathname()
  const { ticket } = parsePageInfo(path, ticketContext)

  useEffect(() => {
    if(ticket && !isNaN(parseInt(ticket.type))){
      getProcedures({company_id:ticket.company_id, ticket_type_id: parseInt(ticket.type)}).then(response =>{
        const parsed = JSON.parse(response)
        setProcedures(parsed)
      })
    }
  }, [])
  

  return(
    <div>
      {
        procedures ?
        procedures.map(el => {
          if(el.input_type == 1){
            return(
              <RadioInput key={el.id} isInteractive={true} label={el.label} Modal={<InfoModal title={el.modal_title} body={el.modal_body}/>} id={el.id}/>
            )
          }
          // else if(el.input_type == 1){
          //   return(
          //     <TextInput key={el.id}  label={el.label}  id={id} />
          //   )
          // }
        })
        :
        null
      }
    </div>
  )
}

