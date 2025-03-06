'use client'

import { useState, useEffect} from "react";
import { Autocomplete, AutocompleteItem, Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Tooltip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { ArrowRightStartOnRectangleIcon, HomeIcon, AdjustmentsHorizontalIcon} from "@heroicons/react/24/solid"
import { signOut, useSession } from "next-auth/react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

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
  const session = useSession()
  
  const isManager = session?.data?.user.roles.includes('3')

  return(
    <div className="flex flex-col p-2 gap-2">
      <Button className="" onPress={() => router.push('/monitor/procedures')}>Procedimentos</Button>
      <Button className="" onPress={() => router.push('/monitor/scheduler')}>Agenda</Button>
      <Button className="" onPress={() => router.push('/monitor/telephonics')}>Telefonia</Button>
      {
        isManager &&
        <Button className="" onPress={() => router.push('/monitor/management')}>Gerenciamento</Button>
      }
    </div>
  )
}

interface Usr {
  id:number;
  name: string;
  tma:string;
  tmames: string;
  queues: number;
}

function WorkerCard({user}: {user: Usr}){
  
  return(
    <Card classNames={{base: 'text-secondary w-48 min-w-48 p-2 m-1'}}>
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md text-primary">{user.name}</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <p>TMA dia: {user.tma}</p>
        <p>TMA mês: {user.tmames}</p>
        <p>Filas: {user.queues}</p>
      </CardBody>
      <Divider />
      <CardFooter>
        <div >
          {/* <Button color="danger">Remover</Button> */}
        </div>
      </CardFooter>
    </Card>
  )
}
const usr = {id: 1, name:'jack', tma:'05:32', tmames:'04:28', queues: 5 }
const users = [usr, {...usr, id:2}, {...usr, id:3}, {...usr, id:4}, {...usr, id:5}, {...usr, id:6}, {...usr, id:7}, {...usr, id:8}, {...usr, id:9}]

export function TeamView(){

  return(
    <div>
      <p className="font-bold text-lg">Minha equipe</p>
      <p>Número de pessoas: {users.length}</p>
      <div className="flex flex-row w-full gap-1 overflow-auto">
        {
          users.map(el=>
            <WorkerCard user={el} key={el.id} />  
          )
        }
      </div>
    </div>
  )
}

export function TeamSummary({data}:{data: {tmat: string, npar: number, nt: number, tmac: string, nc: number}}){
  
  
  return(
    <div className=" w-full gap-1 overflow-auto">
      <Card classNames={{base:'text-secondary'}}>
        <CardBody>
          <p>Número de participantes: {data.npar}</p>
          <p>Telefônicos: {data.nt} </p>
          <p>TMA telefonico: {data.tmat} </p>
          <p>Chat: {data.nc} </p>
          <p>TMA chat: {data.tmac} </p>
        </CardBody>
      </Card>
    </div>
  )
}

export function TeamPerformanceChart ()  {

  const now = new Date()

  const days = Array.from(Array(now.getDate()).keys()).map(() => [] as number[])

  // tickets.forEach((el) => {
  //   const tickDate = el.createdAt.getDate()
  //   days[tickDate-1]?.push(el.id)
  // })
  // const data = days.map((el, index) => ({name: index+1+'', atendimentos:el.length}))

  const data = [{ name: 'Dia 1', atendimentos: 5}, { name: 'Dia 2', atendimentos: 13, amt: 2000}, { name: 'Dia 3', atendimentos: 8, amt: 2000}, { name: 'Dia 4', atendimentos: 31, amt: 2000}, { name: 'Dia 5', atendimentos: 27, amt: 2000}];
  return (
    <BarChart width={600} height={300} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
      <Bar dataKey="atendimentos" stroke="#8884d8" fill="#235AB4" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
    </BarChart>
  )
}

export function TeamAnnouncementTab(){
  const [announcement, setAnnouncement] = useState('')

  return(
    <div >
      <p className="text-primary text-lg font-bold">Anunciar em Teleprompter</p>
      <Input value={announcement} onValueChange={setAnnouncement} classNames={{base:"h-20 text-wrap w-72"}}/>
      <Button color='primary'>Enviar</Button>
    </div>
  )
}