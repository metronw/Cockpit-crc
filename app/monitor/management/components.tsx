'use client'

import {  Autocomplete, AutocompleteItem, Button, Chip, Divider, Input } from "@nextui-org/react"
import { useMonitorContext } from "../providers"
import {useState, useEffect} from 'react'
import { useManagementContext } from "./providers"
import { ICompanyGroup, upsertCompanyGroup } from "@/app/actions/company"
import { Company } from "@prisma/client"

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
  const [item, setItem] = useState<string | undefined>()

  useEffect(()=>{
    const group: ICompanyGroup | undefined = companyGroups.find(el => el.id == parseInt(item ?? '0'))
    if(group){
      setSelectedCompanyGroup(group)
    }else{
      setSelectedCompanyGroup(null)
    }
  }, [item])

  useEffect(()=>{
    setItem(selectedCompanyGroup ? selectedCompanyGroup.id+'' : undefined)
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
    await upsertCompanyGroup(newCG)
    setIsLoadingCompanyGroups(true)
    setNewCG(iniCG)
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
          <div className="flex flex-row flex-wrap w-120 h-32 border rounded">
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