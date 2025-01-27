'use client'

import {  Autocomplete, AutocompleteItem, Button } from "@nextui-org/react"
import { useMonitorContext } from "../providers"
import {useState} from 'react'

export function CompanySelector(){
  const {companies} = useMonitorContext()
  const [company, setCompany] = useState(null)

  return(
    <div>
      <Autocomplete
        variant={'bordered'}
        aria-label={'Empresa'}
        label={'Empresa'}
        defaultSelectedKey=""
        // @ts-expect-error: library has wrong type
        onSelectionChange={setCompany}
        selectedKey={company}
        className="flex h-11 max-w-xs my-1"
        classNames={{
          popoverContent: 'bg-zinc-500 ',
          base: 'flex shrink '
        }}
      >
        {companies.map((item:{id:number, fantasy_name: string}) => <AutocompleteItem key={item.id} textValue={item.fantasy_name}>{item.fantasy_name}</AutocompleteItem>)}
      </Autocomplete>
      <Button>Adicionar a grupo</Button>
      <Button>Editar</Button>
    </div>
  )

  
}