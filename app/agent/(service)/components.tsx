"use client"

import { Card, CardBody, Autocomplete, AutocompleteItem, RadioGroup, Radio, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Snippet } from "@nextui-org/react";
import Link  from 'next/link'
import { ITicket, useTicketContext } from "@/app/agent/providers"
import {useState, useEffect} from 'react'
import {Input} from "@nextui-org/react"
import {createMetroTicket} from '@/app/actions/api'


export const TextInput = ({id, fieldName, label}: {id: number, fieldName: 'client_name' | 'phone' | 'cpf' | 'address', label: string}) => {

  const {ticketContext, updateContext} = useTicketContext()
  const [value, setValue] = useState<string>('')
  const [debouncedValue, setDebouncedValue] = useState<string>('')

  useEffect(()=>{
    const ticket = ticketContext.tickets.find(el => el.id == id)
    if(ticket){
      setValue(ticket[fieldName] ?? '')
      setDebouncedValue(ticket[fieldName] ?? '')
    }

  }, [JSON.stringify(ticketContext)])

  useEffect(()=>{
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 250); // Save only after 250ms of inactivity
    return () => {
      clearTimeout(handler);
    };
  }, [value])

  useEffect(()=>{
    const newContext = {...ticketContext, tickets: ticketContext.tickets.map(el => el.id == id ? {...el, [fieldName]: debouncedValue} : el)}
    updateContext(newContext)
  }, [debouncedValue])
  
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

export const IssueSelector = ({id, fieldName, placeholder, dataSource}: {id: number, fieldName: 'issue' | 'status', placeholder: string, dataSource: any }) => {

  // const items = [{id: 'sem conect', label:"Sem conexão"}, {id: 'break', label: 'Quebra'}]
  const [items, setItems ] = useState([])
  const {ticketContext, updateContext} = useTicketContext()
  const ticket = ticketContext.tickets.find(el => el.id == id)
  const [value, setValue] = useState<string>(ticket ? ticket[fieldName] : '')

  useEffect(()=>{
    dataSource().then((data:string) => {
      setItems(JSON.parse(data))
    })

  }, [])
  
  useEffect(()=>{
    const ticket = ticketContext.tickets.find(el => el.id == id)
    setValue(ticket ? ticket[fieldName] : '')

  }, [ticketContext])

  useEffect(()=>{
    const newContext = {...ticketContext, tickets: ticketContext.tickets.map(el => el.id == id ? {...el, [fieldName]: value} : el)}
    updateContext(newContext)
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
      // @ts-ignore
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

export const RadioInput = ({isInteractive=false, procedure, Modal }: {isInteractive?: boolean, procedure: string, Modal: any}) => {

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
  const [scrollBehavior, setScrollBehavior] = useState<"inside" | "normal" | "outside" | undefined >("inside");

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

  return(
    <Button onPress={() => createMetroTicket()}>
      Finalizar
    </Button>
  )
}

export const TicketSummary = ({id}: {id:number}) => {

  const {ticketContext, updateContext} = useTicketContext()
  const ticket = ticketContext.tickets.find(el => el.id == id)

  return(
    <Snippet  size="md" symbol={""} classNames={{base: 'border border-primary px-4 text-priamry py-3'}}>
      <p>Nome de Assinante:</p>
      <p>Tipo de atendimento: </p>
      <p>Nome do solicitante: </p>
      <p>Endereço:</p>
      <p>Problema alegado</p>
      <p>Procedimentos Realizados</p>
      <p>Data/Horário</p>
      <p>Melhor horário para retorno</p>
      <p>Telefone</p>
      <p>Protocolo</p>
      <p>Protocolo Chat</p>
      <p>Atendente</p>
    </Snippet>
  )
}

