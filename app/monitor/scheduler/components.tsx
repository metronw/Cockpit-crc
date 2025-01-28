'use client'

import { Autocomplete, AutocompleteItem, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue, Input, Switch, Accordion, AccordionItem } from "@nextui-org/react"

import { useState, useEffect } from "react"
import { batchAssignUser, deleteUserAssign } from "@/app/actions/userAssign";
import {toast} from 'react-hot-toast';
import { ICompanyGroup, upsertCompany } from "@/app/actions/company";
import { useMonitorContext } from "../providers";
import { Company } from "@prisma/client";

const queueTypes= [
  {id: '1', name: 'Telefônico'},
  {id: '2', name: 'Chat'}
]

const emptyCompGroup: ICompanyGroup = {id:0, name:'', company_list:[]}

export function Scheduler(){

  const {users, companies, setIsLoadingAssigns, companyGroups} = useMonitorContext()


  const [company, setCompany] = useState(null)
  const [companyGroup, setCompanyGroup] = useState(emptyCompGroup)
  const [user, setUser] = useState(null)
  const [queueType, setQueueType] = useState('1')
  const [isUsingGroup, setIsUsingGroup] = useState(false)

  return(
    <>
      <Switch defaultSelected isSelected={isUsingGroup} onValueChange={setIsUsingGroup} classNames={{label: "text-primary"}}>Grupo de empresas</Switch>
      <div className="flex flex-row gap-2 my-2">
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
            popoverContent: 'bg-zinc-500 ',
            base: 'flex shrink '
          }}
        >
          {users.map((item:{id:number, name: string}) => <AutocompleteItem key={item.id} textValue={item.name}>{item.name}</AutocompleteItem>)}
        </Autocomplete>

          {
            isUsingGroup ?
            <Autocomplete
              variant={'bordered'}
              aria-label={'Grupo de Empresas'}
              label={'Grupo de Empresas'}
              defaultSelectedKey=""
              onSelectionChange={(val) => {setCompanyGroup(companyGroups.find(el => el.id == val) ?? emptyCompGroup)}}
              selectedKey={companyGroup.id+''}
              className="flex h-11 max-w-xs my-1"
              classNames={{
                popoverContent: 'bg-zinc-500 ',
                base: 'flex shrink '
              }}
            >
              {companyGroups.map((el:{id:number, name: string}) => <AutocompleteItem key={el.id} textValue={el.name}>{el.name}</AutocompleteItem>)}
            </Autocomplete>
            :
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
          }



        <Autocomplete
          variant={'bordered'}
          aria-label={'Tipo de fila'}
          label={'Tipo de fila'}
          defaultSelectedKey=""
          // @ts-expect-error: library has wrong type
          onSelectionChange={setQueueType}
          selectedKey={queueType}
          className="flex h-11 max-w-xs my-1"
          classNames={{
            popoverContent: 'bg-zinc-500 ',
            base: 'flex shrink '
          }}
        >
          {queueTypes.map((item:{id:string, name: string}) => <AutocompleteItem key={item.id} textValue={item.name}>{item.name}</AutocompleteItem>)}
        </Autocomplete>

        <Button  
          className='w-16' 
          onPress={() => batchAssignUser({companies: isUsingGroup ? (companyGroup.id != 0 ? companyGroup.company_list.map(el=>el.id) : [] ) : [parseInt(company ?? '0')], user_id: user ? parseInt(user) : user, queue_type: parseInt(queueType)})
            .then(() => {
              toast.success('atribuído com sucesso')
              setIsLoadingAssigns(true)
            })
            .catch(() => toast.error('preencha todos os campos'))} >
            Atribuir
        </Button>
      </div>
    </>

  )
}

const assignColumns= [
  {
    key: 'companyName',
    label: 'Empresa'
  },
  {
    key: 'userName',
    label: 'Nome do Agente'
  },
  {
    key: 'queue_type',
    label: 'Tipo de Fila'
  },

]

export function AssignmentTable(){

  const { assignments, setIsLoadingAssigns} = useMonitorContext()
  const [ready, setReady] = useState<boolean>(false)

  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [userFilter, setUserFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [queueTypeFilter, setQueueTypeFilter] = useState('');

  const [formattedAssignments, setFormattedAssignments] = useState(assignments?.map(el => ({
    ...el, 
    userName: el.user.name,
    queue_type: queueTypes.find(q => q.id === el.queue_type.toString())?.name || el.queue_type
  })));
  
  useEffect(()=> {
    const newAssign = assignments?.filter(el => 
      el.user.name.toLowerCase().includes(userFilter.toLowerCase()) && 
      el.companyName.toLowerCase().includes(companyFilter.toLowerCase()) &&
      (queueTypeFilter === '' || queueTypes.find(q => q.id === el.queue_type.toString())?.name === queueTypeFilter)
    );
    setFormattedAssignments(newAssign?.map(el => ({
      ...el, 
      userName: el.user.name,
      queue_type: queueTypes.find(q => q.id === el.queue_type.toString())?.name || el.queue_type 
    })));
  }, [userFilter, companyFilter, queueTypeFilter, assignments]);
 
  useEffect(()=> {
    setReady(true)
  }, []);

  return (
    <>
      <div className="flex flex-row gap-2 my-2">
        <Input type='text' label='Empresa' placeholder='Filtrar empresa' value={companyFilter} onValueChange={setCompanyFilter}></Input>
        <Input type='text' label='Usuário' placeholder='Filtrar usuário' value={userFilter} onValueChange={setUserFilter}></Input>
        <select title="any" value={queueTypeFilter} onChange={(e) => setQueueTypeFilter(e.target.value)} className="flex h-11 max-w-xs my-1">
          <option value=''>Todos os tipos de fila</option>
          {queueTypes.map((item) => (
            <option key={item.id} value={item.name}>{item.name}</option>
          ))}
        </select>
      </div>
      {
        ready && (
          <Table 
            aria-label="users"
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            // @ts-expect-error: library has wrong type
            onSelectionChange={setSelectedKeys}
            classNames={{wrapper:'overflow-auto h-96'}}
          >
            <TableHeader columns={assignColumns}>
              {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            <TableBody items={formattedAssignments}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell key={item.id +columnKey.toString()}>{getKeyValue(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        )
      }
        <Button
          className='w-40' 
          onPress={() => deleteUserAssign( Array.from(selectedKeys).map(el => parseInt(el)))
            .then(() => {
              toast.success('deletado com sucesso')
              setIsLoadingAssigns(true)
          })
            .catch(() => toast.error('deu algo de errado'))} >
            Deletar Atribuições
        </Button>
    </>
  );
}

export function CompanyConfig({metroCompanies}:{metroCompanies: Company[]}) {

  const { companies, setIsLoadingComps} = useMonitorContext()
  const [company, setCompany] = useState<Company | undefined>(undefined)

  const onSelectionChange = (val:string) => {
    if(val){
      const comp = companies.find(el => el.id == parseInt(val))
      if(comp) {
        setCompany(comp)
      }else{
        const metroComp = metroCompanies.find(el => el.id == parseInt(val))
        setCompany({id: metroComp?.id ?? 0, fantasy_name: metroComp?.fantasy_name ?? '', threshold_1: 0, threshold_2: 0})
      }      
    }else{
      setCompany(undefined)
    }
  }

  const onValueChange = (val:string, field: string) => {
    if(company){
      setCompany({...company, [field]: parseInt(val)})
    }
  }

  const save = async () => {
    upsertCompany({id: company?.id ?? null, fantasy_name: company?.fantasy_name ?? '', threshold_1: company?.threshold_1 ?? 0, threshold_2: company?.threshold_2 ?? 0}).then((resp) =>{
      if(resp.status == 200){
        toast.success('salvo com sucesso')
        setIsLoadingComps(true)
      }else{
        toast.error('algo deu errado')
      }
    }).catch(() => {
      toast.error('algo deu errado')
    })
    
  }

  return(
    <Accordion>
      <AccordionItem startContent={<p>Configurar Empresa</p>} classNames={{heading: "bg-gray-100 hover:bg-gray-200 rounded px-3"}}>
        <Autocomplete
          variant={'bordered'}
          aria-label={'Empresa do Gestor'}
          label={'Empresa do Gestor'}
          placeholder="Empresa do gestor"
          defaultSelectedKey=""
          // @ts-expect-error: library has wrong type
          onSelectionChange={onSelectionChange}
          selectedKey={company?.id+''}
          className="flex h-11 max-w-xs my-1"
          classNames={{
            popoverContent: 'bg-zinc-500 ',
            base: 'flex shrink '
          }}
        >
          {metroCompanies.map((item:{id:number, fantasy_name: string}) => <AutocompleteItem key={item.id} textValue={item.fantasy_name}>{item.fantasy_name}</AutocompleteItem>)}
        </Autocomplete>
        <div className="flex flex-row gap-2">
          <Input classNames={{base:'w-32'}} type="number" label='Limite' value={company?.threshold_1+''} onValueChange={(val) => onValueChange(val, 'threshold_1')}/>
          <Input classNames={{base:'w-32'}} type="number" label='Transbordo' value={company?.threshold_2+''} onValueChange={(val) => onValueChange(val, 'threshold_2')} />
          <Button onPress={save} >Salvar</Button>
        </div>  
      </AccordionItem>
    </Accordion>
  )
}

