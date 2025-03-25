'use client'

import {  Autocomplete, AutocompleteItem, Button, Checkbox, Chip, Divider, Input, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react"
import { useMonitorContext } from "../providers"
import {useState, useEffect, useMemo} from 'react'
import { useManagementContext } from "./providers"
import { ICompanyGroup, upsertCompanyGroup } from "@/app/actions/company"
import { Company, Compliance_term, User_schedule } from "@prisma/client"
import { toast } from "react-toastify"
import { deleteComplianceTerm, getAllComplianceTerm, updateComplianceTerm, uploadTerm } from "@/app/actions/complianceTerm"
import { UserWithSession, getAllUsers } from "@/app/actions/session"
import { createUserSchedule, deleteUserSchedule, getUserSchedule, updateUserSchedule } from "@/app/actions/schedule"
import { getMetroId } from "@/app/actions/api"

export function CompanySelector({addCompany}:{addCompany:(comp:Company)=>void}){
  const {companies} = useMonitorContext()
  const {setSelectedCompany} = useManagementContext()

  const [item, setItem] = useState('0')

  useEffect(() => {
    const resp = companies.find(el => parseInt(item) == el.id)    
    if(resp){
      setSelectedCompany(resp)
      addCompany(resp)
    }
  },  [item])

  return(
    <div>
      <Autocomplete
        variant={'bordered'}
        aria-label={'Empresa'}
        label={'Empresa'}
        defaultSelectedKey=""
        // @ts-expect-error: library has wrong type
        onSelectionChange={setItem}
        selectedKey={item}
        className="flex h-11 max-w-xs my-1"
        classNames={{
          popoverContent: 'bg-zinc-500 ',
          base: 'flex shrink '
        }}
      >
        {companies.map((item:{id:number, fantasy_name: string}) => <AutocompleteItem key={item.id} textValue={item.fantasy_name}>{item.fantasy_name}</AutocompleteItem>)}
      </Autocomplete>
    </div>
  )  
}


export function CompanyGroupSelector(){
  const {companyGroups} = useMonitorContext()
  const {setSelectedCompanyGroup, selectedCompanyGroup} = useManagementContext()
  const [item, setItem] = useState<string>('')

  useEffect(()=>{
    const group: ICompanyGroup | undefined = companyGroups.find(el => el.id == parseInt(item ?? '0'))
    if(group){
      setSelectedCompanyGroup(group)
    }else{
      setSelectedCompanyGroup(null)
    }
  }, [item])

  useEffect(()=>{
    setItem(selectedCompanyGroup ? selectedCompanyGroup.id+'' : '')
  }, [selectedCompanyGroup])
  

  return(
    <div className="flex flex-row gap-2">
      <Autocomplete
        variant={'bordered'}
        aria-label={'Grupo de Empresas'}
        label={'Grupo de Empresas'}
        defaultSelectedKey=""
        // @ts-expect-error: library has wrong type
        onSelectionChange={setItem}
        selectedKey={item}
        
        className="flex h-11 max-w-xs my-1"
        classNames={{
          popoverContent: 'bg-zinc-500 ',
          base: 'flex shrink '
        }}
      >
        {companyGroups.map((el:{id:number, name: string}) => <AutocompleteItem key={el.id} textValue={el.name}>{el.name}</AutocompleteItem>)}
      </Autocomplete>
    </div>
  )
}

const iniCG = {id: 0, name:'', company_list: []}

export function CompanyGroupCreator(){
  const {setIsLoadingCompanyGroups} = useMonitorContext()
  const {selectedCompanyGroup, setSelectedCompanyGroup} = useManagementContext()
  const [isCreating, setIsCreating] = useState(false)
  const [newCG, setNewCG] = useState<ICompanyGroup>(iniCG)

  const createCompanyGroup = () => {
    setSelectedCompanyGroup(null)
    setIsCreating(true)
    setNewCG(iniCG)
  }

  const addCompany = (comp: Company) => {
    const newCL =  !comp || newCG.company_list.find(el => el.id == comp?.id) ? newCG.company_list : [...newCG.company_list, comp]
    setNewCG({...newCG, company_list: newCL})
  }

  const save = async () => {
    upsertCompanyGroup(newCG)
    .then(() => {
      setSelectedCompanyGroup(null)
      setNewCG(iniCG)
      setIsLoadingCompanyGroups(true)
      toast.success('salvo com sucesso')
    }).catch(() => {
      toast.error('deu algo de errado')
    })
  }

  useEffect(()=>{
    if(selectedCompanyGroup){
      setNewCG(selectedCompanyGroup)
      setIsCreating(true)
    }
  }, [selectedCompanyGroup])
  
  return(
    <div>
      <Divider className="my-2"/>
      <Button onPress={createCompanyGroup}>Novo Grupo de Empresas</Button>
      {
        isCreating &&
        <div className="flex flex-col gap-2 my-4 shadow py-2">
          <p>Editar grupo de empresa: {selectedCompanyGroup?.name ?? "Novo Grupo"}</p>
          <Input type="text" className="w-80 " label="Nome do grupo" value={newCG.name} onValueChange={(val) => setNewCG({...newCG, name: val})} />
          <CompanySelector addCompany={addCompany} />
          <div className="flex flex-row flex-wrap w-144 h-40 border rounded p-1">
            {
              newCG.company_list.map(el => 
                <Chip key={el.id} color="primary" onClose={() => setNewCG({...newCG, company_list: newCG.company_list.filter(it => it.id !== el.id)})}>{el.fantasy_name}</Chip>
              )
            }
          </div>
          <Button className="w-40" onPress={save}>Salvar</Button>
        </div>
      }
    </div>
  )
}

export function UploadTerm(){

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];

      if (selectedFile.type !== "application/pdf") {
        alert("Please select a valid PDF file.");
        return;
      }

      setFile(selectedFile);
    }
  };

  const uploadPDF = async () => {
    if(!file){
      return
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error uploading file');
      }

      const data = await response.json();

      const resp = await uploadTerm({url: data.url})
      if(resp.status==200){
        toast.success('termo salvo com sucesso')
      }

      
      return data.url; // URL of the uploaded image
    } catch (error) {
      toast.error('o termo não foi carregado')
      console.error('Error uploading document:', error);
      return null;
    }
  };

  return(
    <div>
      <p className="text-primary" >Termo de consentimento</p>
      <Input type='file' className="w-72" accept="application/pdf" onChange={handleFileChange} />
      {file && <p className="text-sm text-gray-600">Selected: {file.name}</p>}
      <Button onPress={uploadPDF}>Upload de termo</Button>
    </div>
  )
}

export function TermTable (){

  const [items, setItems ] = useState<Compliance_term[] | []>([])

  const onActivate = (term:Compliance_term) => {
    const newTerm = {...term, is_active: !term.is_active}
    updateComplianceTerm(newTerm).then(()=>{
      getItems()
    })
  }

  const getItems = () => {
    getAllComplianceTerm().then(resp => {
      const citems:Compliance_term[] = resp.status == 200 ? resp.message : []
      setItems(citems)
    })
  }

  const deleteItem = (term:Compliance_term) => {
    deleteComplianceTerm(term).then((resp)=>{
      if(resp.status == 200){
        getItems()
      }
    })
  }

  useEffect(() =>{
    getItems()
  }, [])


  return(
    <Table 
      aria-label="users"
      classNames={{wrapper:'overflow-auto h-120 h-max-2/3'}}
    >
      <TableHeader >
        <TableColumn key={'createdAt'}>{'Criado em'}</TableColumn>
        <TableColumn key={'created_by'}>{'Criado por'}</TableColumn>
        <TableColumn key={'file'}>{'URL do Arquivo'}</TableColumn>
        <TableColumn key={'active'}>{'ativo'}</TableColumn>
        <TableColumn key={'delete'}>{'deletar'}</TableColumn>
      </TableHeader>
      <TableBody items={items}>
        {(item) => (
          <TableRow key={item.id}>
            <TableCell key={item.id +'created_bt'}>{item.created_by}</TableCell>
            <TableCell key={item.id +'createdAt'}>{item.createdAt.toDateString()}</TableCell>
            <TableCell key={item.id +'file'}>{item.file}</TableCell>

            <TableCell key={item.id +'-check'}>
              <Checkbox
                isSelected={item.is_active}
                onChange={() => onActivate(item)}
              />
            </TableCell>

            <TableCell key={item.id +'-delete'}>
              <Button color="danger" onPress={() => deleteItem(item)} >Deletar</Button>
            </TableCell>
            
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export function UsersTable(){

  const [items, setItems ] = useState<UserWithSession[] | []>([])  
  const [filteredItems, setFilteredItems ] = useState<UserWithSession[] | []>([])  
  const [filter, setFilter] = useState('')
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [currentUser, setCurrentUser] = useState<undefined | UserWithSession>(undefined)
  const rowsPerPage = 5

  const getItems = () => {
    getAllUsers().then(resp => {
      setItems(resp)
      setFilteredItems(resp)
      setPages(Math.floor(resp.length/rowsPerPage))
    })
  }

  useEffect(() => {
    const filtered = items.filter(el => el.name.toLowerCase().startsWith(filter.toLowerCase()))
    setFilteredItems(filtered)
    setPage(1)
  }, [filter])

  useEffect(() =>{
    getItems()
  }, [])

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  return(
    <div className="mx-2">
      <p>Tabela de usuários</p>      
      <Table 
        aria-label="users"
        classNames={{wrapper:'overflow-auto h-120 h-max-2/3'}}
        topContent={<Input type='text' value={filter} onValueChange={setFilter}  className={'w-80'} label={'Filtro'} />}
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader >
          <TableColumn key={'nome'}>{'Usuário'}</TableColumn>
          <TableColumn key={'team'}>{'Equipe'}</TableColumn>
          <TableColumn key={'isOnline'}>{'Online'}</TableColumn>
          <TableColumn key={'edit'}>{'Editar'}</TableColumn>
        </TableHeader>
        <TableBody items={paginatedItems}>
          {(item) => (            
            <TableRow key={item.id}>
              <TableCell key={item.id +'nome'}>{item.name}</TableCell>
              <TableCell key={item.id +'team'}>{item.team_id}</TableCell>
              <TableCell key={item.id +'isOnline'}>{item.session_history.length > 0 ? 'Sim' : 'Não'}</TableCell>
              <TableCell key={item.id +'edit'}><Button onPress={()=>setCurrentUser(item)} >Editar</Button></TableCell>
            </TableRow>            
          )}
        </TableBody>
      </Table>
      {
        currentUser ?
          <SchedulerTable user={currentUser} handleClose={()=>setCurrentUser(undefined)}/> :
          null
      }
    </div>
  )  
}

export function SchedulerTable({user, handleClose}:{user:UserWithSession, handleClose: ()=>void}){

  const [schedule, setSchedule] = useState<User_schedule[]>([])
  const [loading, setloading] = useState(true)

  useEffect(()=>{
    if(loading){
      getUserSchedule(user.id).then(resp => {
        setSchedule(resp)
        setloading(false)
      })
    }
  }, [loading])

  const setScheduleItem = (value: string, id: number, item: string) => {
    const sched: User_schedule | undefined = schedule.find(el => el.id == id)
    if(sched){
      const newSched: User_schedule = {...sched, [item]: value}
      setSchedule(schedule.map(el => el.id != newSched.id ? el : newSched))
    }
  }

  const addSchedule = async () => {    
    createUserSchedule(user.id).then(()=> {
      setloading(true)
    })
  }

  const updateSchedule = async (item: User_schedule) => {    
    updateUserSchedule(item).then(()=> {
      setloading(true)
    })
  }

  const deleteSchedule = async (item: number) => {
    deleteUserSchedule(item).then(()=> {
      setloading(true)
    })
  }

  return(
    <div >
      <p>Editar Horários de {user.name}</p>
      <Table 
        aria-label="users"
        classNames={{wrapper:'overflow-auto h-120 h-max-2/3'}}
      >
        <TableHeader >
          <TableColumn key={'is_active'}>{'Ativo?'}</TableColumn>
          <TableColumn key={'monday'}>{'Segunda'}</TableColumn>
          <TableColumn key={'tuesday'}>{'Terça'}</TableColumn>
          <TableColumn key={'wednesday'}>{'Quarta'}</TableColumn>
          <TableColumn key={'thursday'}>{'Quinta'}</TableColumn>
          <TableColumn key={'friday'}>{'Sexta'}</TableColumn>
          <TableColumn key={'saturday'}>{'Sábado'}</TableColumn>
          <TableColumn key={'sunday'}>{'Domingo'}</TableColumn>
          <TableColumn key={'save'}>{'Salvar'}</TableColumn>
          <TableColumn key={'delete'}>{'Deletar'}</TableColumn>
        </TableHeader>
        <TableBody items={schedule}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell key={item.id +'ativo'}>{item.is_active}</TableCell>
              <TableCell key={item.id +'monday'}><Input value={item.monday} onValueChange={(value)=> setScheduleItem(value, item.id, 'monday')}/></TableCell>
              <TableCell key={item.id +'tuesday'}><Input value={item.tuesday} onValueChange={(value)=> setScheduleItem(value, item.id, 'tuesday')}/></TableCell>
              <TableCell key={item.id +'wednesday'}><Input value={item.wednesday} onValueChange={(value)=> setScheduleItem(value, item.id, 'wednesday')}/></TableCell>
              <TableCell key={item.id +'thursday'}><Input value={item.thursday} onValueChange={(value)=> setScheduleItem(value, item.id, 'thursday')}/></TableCell>
              <TableCell key={item.id +'friday'}><Input value={item.friday} onValueChange={(value)=> setScheduleItem(value, item.id, 'friday')}/></TableCell>
              <TableCell key={item.id +'saturday'}><Input value={item.saturday} onValueChange={(value)=> setScheduleItem(value, item.id, 'saturday')}/></TableCell>
              <TableCell key={item.id +'sunday'}><Input value={item.sunday} onValueChange={(value)=> setScheduleItem(value, item.id, 'sunday')}/></TableCell>
              <TableCell key={item.id +'save'}><Button onPress={()=> updateSchedule(item)}>Salvar</Button></TableCell>
              <TableCell key={item.id +'delete'}><Button onPress={()=> deleteSchedule(item.id)}>Deletar</Button></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-row gap-2 p-2">
        <Button color="secondary" onPress={addSchedule}>Novo</Button>
        <Button color="danger" onPress={handleClose}>Fechar</Button>
      </div>
    </div>
  )
}



