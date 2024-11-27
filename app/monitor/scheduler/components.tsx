'use client'

import { Autocomplete, AutocompleteItem } from "@nextui-org/react"
import { useState } from "react"
// import {switchCompany} from '@/app/actions/api' 

export function Scheduler({companies, users}: {companies: Array<any>, users: Array<any>}){

  const [company, setCompany] = useState(null)
  const [user, setUser] = useState(null)

  return(
    <>
      <Autocomplete
        variant={'bordered'}
        aria-label={'Empresa'}
        label={'Usuários'}
        defaultSelectedKey=""
        // @ts-expect-error: library has wrong type
        onSelectionChange={setUser}
        selectedKey={user}
        className="flex h-11 max-w-xs my-1"
        classNames={{
          popoverContent: 'bg-zinc-500 border-primary border rounded-medium',
          base: 'flex shrink border-primary border rounded-medium'
        }}
      >
        {users.map((item:{id:number, name: string}) => <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>)}
      </Autocomplete>

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
          popoverContent: 'bg-zinc-500 border-primary border rounded-medium',
          base: 'flex shrink border-primary border rounded-medium'
        }}
      >
        {companies.map((item:{id:number, fantasy_name: string}) => <AutocompleteItem key={item.id}>{item.fantasy_name}</AutocompleteItem>)}
      </Autocomplete>
      {/* <Button className='w-16' onPress={() => switchCompany(user, company)} >Atribuir</Button> */}

    </>

  )
}

