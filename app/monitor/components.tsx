'use client'

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Autocomplete, AutocompleteItem, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { ArrowRightStartOnRectangleIcon, HomeIcon, AdjustmentsHorizontalIcon} from "@heroicons/react/24/solid"
import { signOut, useSession } from "next-auth/react";

export function Options ({ placeholder, dataSource, isRequired}: { placeholder: string, dataSource:  () => Promise<string>, isRequired: boolean }) {

  const [value, setValue] = useState(null)
  const [items, setItems] = useState([])

  useEffect(()=>{
    dataSource().then((data:string) => {
      setItems(JSON.parse(data))
    })
  }, [dataSource])

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

const options = [{id: 1, label: 'bool'}, {id: 2, label:'text'}, /*{id: 3, label:'options'}, */ /*{id:4, label: 'date'}*/ ]

export const MonitorHeader = () => {

  const router = useRouter()
  const session = useSession()
  
  return (
    <div className='grid grid-cols-12'>
      <div className='flex flex-row gap-4 col-span-3 pl-4'>
      <Button isIconOnly color="primary" aria-label="home" onPress={() => router.push('/agent/'+session.data?.user.id)}>
        <HomeIcon />
      </Button>
      <Button isIconOnly color="primary" onPress={() => router.push('/monitor')}>
        <AdjustmentsHorizontalIcon />
      </Button>
      </div>
      <div className="flex flex-row col-span-8 space-x-4 items-center ">
        
      </div>
      <Button isIconOnly color="primary" aria-label="logout" onPress={() => signOut({callbackUrl:'/login'})}>
      <ArrowRightStartOnRectangleIcon className="col-span-1 h-10 "/>
      </Button>
      
    </div>
  )
}


export const MonitorSidebar = () =>{
  const router = useRouter()

  return(
    <div className="flex flex-col p-2 gap-2">
      <Button className="" onPress={() => router.push('/monitor/procedures')}>Procedimentos</Button>
      <Button className="" onPress={() => router.push('/monitor/scheduler')}>Agenda</Button>
    </div>
  )
}