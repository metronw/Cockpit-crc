"use client"

import { useState, useMemo } from "react";
import { Card, CardBody, Autocomplete, AutocompleteItem, Button, Input, RadioGroup, Radio } from "@nextui-org/react";
import Link  from 'next/link'

export const ServiceNavBar = () => {
  const [route, setRoute] = useState('')

  let tabs = [
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
        <Link href={'/agent/'+el.id}>
          <Card className=" hover:border hover:border-2 hover:bg-primary border-zinc-700">
            <CardBody><p className="text-primary hover:text-white">{el.label + '  >> '} </p></CardBody>
          </Card>
        </Link>
        )}
    </div>
  )
}

export const IssueSelector = ({items=[], placeholder=""}: {items:{id: string, label:string}[], placeholder:string}) => {
  return (
    <Autocomplete
      variant={'bordered'}
      isRequired
      label=""
      defaultItems={items}
      placeholder={placeholder}
      defaultSelectedKey=""
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
