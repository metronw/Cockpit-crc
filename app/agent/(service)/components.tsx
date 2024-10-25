"use client"

import { Card, CardBody, Autocomplete, AutocompleteItem, RadioGroup, Radio } from "@nextui-org/react";
import Link  from 'next/link'
import { ITicket, useTicketContext } from "@/app/providers"
import {useState, useEffect} from 'react'
import {Input} from "@nextui-org/react"

export const TextInput = ({id, fieldName}: {id: number, fieldName: 'name' | 'phone' | 'cpf' | 'address'}) => {

  const {ticketContext, updateContext} = useTicketContext()
  const ticket = ticketContext.tickets.find(el => el.id == id)
  const [value, setValue] = useState<string>(ticket ? ticket[fieldName] : '')
  
  useEffect(()=>{
    const ticket = ticketContext.tickets.find(el => el.id == id)
    setValue(ticket ? ticket[fieldName] : '')

  }, [ticketContext])

  useEffect(()=>{
    const newContext = {...ticketContext, tickets: ticketContext.tickets.map(el => el.id == id ? {...el, [fieldName]: value} : el)}
    updateContext(newContext)
  }, [value])
  
  return(
    <Input type="text" label={fieldName} color={'primary'}  className={'w-80 h-11 ml-4 border border-primary rounded-medium'} value={value} onValueChange={setValue}/>
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

export const IssueSelector = ({id, fieldName, placeholder}: {id: number, fieldName: 'issue' | 'status', placeholder: string }) => {

  const items = [{id: 'sem conect', label:"Sem conexão"}, {id: 'break', label: 'Quebra'}]
  const {ticketContext, updateContext} = useTicketContext()
  const ticket = ticketContext.tickets.find(el => el.id == id)
  const [value, setValue] = useState<string>(ticket ? ticket[fieldName] : '')
  
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
      onSelectionChange={setValue}
      selectedKey={value}
      className="flex h-11 max-w-xs my-1"
      classNames={{
        popoverContent: 'bg-zinc-500 border-primary border rounded-medium',
        base: 'flex shrink border-primary border rounded-medium'
      }}
    >
      {items.map((item) => <AutocompleteItem key={item.id}>{item.label}</AutocompleteItem>)}
    </Autocomplete>
  );
} 

export const RadioInput = ({isInteractive=false, procedure }: {isInteractive?: boolean, procedure: string}) => {
  return(
    <RadioGroup label={procedure} orientation="horizontal" classNames={{label: 'p-1 m-1 rounded ' + (isInteractive ? 'bg-purple-700 text-white' : 'border border-primary text-primary')}}>
      <Radio value="Sim" classNames={{ wrapper: 'border-success', control: 'bg-success' }}></Radio>
      <Radio value="Não" classNames={{ wrapper: 'border-danger', control: 'bg-danger'}}></Radio>
    </RadioGroup>
  )
}
