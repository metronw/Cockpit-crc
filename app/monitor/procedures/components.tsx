'use client'

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Autocomplete, AutocompleteItem, RadioGroup, Radio, Input, Button, useDisclosure, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Checkbox } from "@nextui-org/react";
import { toast } from "react-hot-toast";
import {  createProcedureItem, deleteProcedure, deleteProcedureItem, saveProcedure } from "@/app/actions/procedures";
import { useProcedureContext } from "./providers";
import { RichTextEditor } from "@/app/lib/richTextEditor/richTextEditor";
import { JsonValue } from "@prisma/client/runtime/library";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

const ticketTypeOptions = [{id: 1, label: 'Sim/Não'}, {id: 2, label:'Texto'}, /*{id: 3, label:'options'},*/ /*{id:4, label: 'date'}*/ ]

export function InputPicker(){
  
  const [company, setCompany] = useState(null)
  const [ticketType, setTicketType] = useState(null)
  const {setSelectedCompany, setSelectedTicketType, ticketTypes, companies, setIsLoadingProceds} = useProcedureContext()
  
  useEffect(()=>{
    setSelectedTicketType(ticketType ? parseInt(ticketType) : null)
    setSelectedCompany(company ? parseInt(company): null)
    setIsLoadingProceds(true)
  }, [company, ticketType])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">        

        <Autocomplete
          variant={'bordered'}
          aria-label={'Tipo de Ticket'}
          // isRequired={true}
          label={'Tipo de Ticket'}
          // defaultItems={types}
          defaultSelectedKey=""
          // @ts-expect-error: library has wrong type
          onSelectionChange={setTicketType}
          selectedKey={ticketType}
          className="flex h-11 max-w-xs my-1"
          classNames={{
            popoverContent: 'bg-zinc-500 border-primary border rounded-medium',
            base: 'flex shrink border-primary border rounded-medium'
          }}
        >
          {ticketTypes.map((item:{id:number, label: string}) => <AutocompleteItem key={item.id}>{item.label}</AutocompleteItem>)}
        </Autocomplete>

        <Autocomplete
          variant={'bordered'}
          aria-label={'Empresa'}
          // isRequired={true}
          label={'Empresa'}
          // defaultItems={companies}
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
      </div>
    </div>
  );
}

export function RadioInput ({modalTitle, modalBody, label}:
  {modalTitle:[string, Dispatch<SetStateAction<string>>],
   modalBody:[JsonValue, Dispatch<SetStateAction<JsonValue>>] 
   label:[string, Dispatch<SetStateAction<string>>] 
  }) 
{

  const [description, setDescription] = label
  const [response, setResponse] = useState('')

  const [title] = modalTitle
  const [body] = modalBody
  
  return(
    <div className="flex flex-col gap-2 ">
      <div className="flex flex-row gap-2 border rounded p-2 border-primary">
        <Input 
          label={'Descrição do procedimento'}
          type='text' 
          value={description} 
          color={'primary'}  
          className={'w-80 h-11 border border-primary rounded-medium'}
          onValueChange={setDescription}
        />
        <EditInfoModal modalTitle={modalTitle} modalBody={modalBody} className={''} />
      </div>
      <div className="border border-primary p-3 rounded">
        <span>Preview</span>
        <RadioGroup 
          label={description} orientation="horizontal" 
          classNames={{label: 'p-1 m-1 rounded bg-purple-700 text-white'}}
          value={response}
          onValueChange={setResponse}
        >
          {
            <InfoModal title={title} body={body} />
          }
          <Radio value="Yes" classNames={{ wrapper: 'border-success', control: 'bg-success' }}></Radio>
          <Radio value="No" classNames={{ wrapper: 'border-danger', control: 'bg-danger'}}></Radio>
        </RadioGroup>
      </div>
    </div>
  )
}

interface Option {
  label:string
  id: number
}

export function OptionsInput ({modalTitle, modalBody, label}:
  {modalTitle:[string, Dispatch<SetStateAction<string>>],
   modalBody:[JsonValue, Dispatch<SetStateAction<JsonValue>>] 
   label:[string, Dispatch<SetStateAction<string>>] 
  }) 
{

  const [description, setDescription] = label
  const [response, setResponse] = useState('')
  const [option, setOption] = useState('')
  const [options, setOptions] = useState<Option[]>([])

  const [title] = modalTitle
  const [body] = modalBody
  
  return(
    <div className="flex flex-col ">    
      <div className="flex flex-col gap-2 border border-primary rounded-medium p-2 m-2">
        <Input 
          label={'Descrição do procedimento'}
          type='text' 
          value={description} 
          color={'primary'}  
          className={'w-80 h-11 border border-primary rounded-medium'}
          onValueChange={setDescription}
        />
        <div className="flex flex-row gap-2 ">
        <Input 
          label={'Opção'}
          type='text' 
          value={option} 
          color={'primary'}  
          className={'w-80 h-11 '}
          onValueChange={setOption}
        />
        <Button onPress={() => setOptions((prev ) => [...prev, {id:prev.length, label: option}])} > Adicionar opção</Button>
        </div>
        <EditInfoModal modalTitle={modalTitle} modalBody={modalBody} className={''} />
      </div>  

      <div className="flex flex-col border border-primary p-3 rounded gap-2">
        <span className="bg-purple-700 rounded p-2 text-white my-2 ">{description} </span>
        <div className="flex flex-row gap-2">
          <InfoModal title={title} body={body} />
          <Autocomplete
            variant={'bordered'}
            aria-label={'Tipo de Input'}
            // isRequired={true}
            label={'Tipo de Input'}
            defaultItems={options}
            defaultSelectedKey=""
            // @ts-expect-error: library has wrong type
            onSelectionChange={setResponse}
            selectedKey={response}
            className="flex h-11 max-w-xs my-1"
            classNames={{
              popoverContent: 'bg-zinc-500 border-primary border rounded-medium',
              base: 'flex shrink border-primary border rounded-medium'
            }}
          >
            {options.map((item:{id:number, label: string}) => <AutocompleteItem key={item.id}>{item.label}</AutocompleteItem>)}
          </Autocomplete>
        </div>
      </div>
    </div>
  )
}

export function TextInput ({  modalTitle, modalBody, label }:
  {modalTitle:[string, Dispatch<SetStateAction<string>>],
   modalBody:[JsonValue, Dispatch<SetStateAction<JsonValue>>] 
   label:[string, Dispatch<SetStateAction<string>>]}) {

  const [response, setResponse] = useState('')
  const [procedure, setProcedure] = modalTitle

  const [title] = modalTitle
  const [body] = modalBody

  return(
    <div className="flex flex-col gap-2 ">      
      <div className="flex flex-col gap-2">

        <Input 
          label={'Descrição do Procedimento'}
          type='text' 
          value={label[0]} 
          color={'primary'}  
          className={'w-80 h-11 border border-primary rounded-medium'}
          onValueChange={label[1]}
        />
        <Input 
          label={'Título'}
          type='text' 
          value={procedure} 
          color={'primary'}  
          className={'w-80 h-11 border border-primary rounded-medium'}
          onValueChange={setProcedure}
        />
        <EditInfoModal modalTitle={modalTitle} modalBody={modalBody} className={''} />
      </div>
      <div className="flex flex-col border border-primary p-3 gap-2 rounded">
        <span>Preview</span>
        <span className="bg-purple-700 text-white rounded p-2">{label[0] }</span>
        <Input 
          label={procedure}
          type='text' 
          value={response} 
          color={'primary'}  
          className={'w-80 h-11 border border-primary rounded-medium'}
          onValueChange={setResponse}
        />
        {
          <InfoModal title={title} body={body} />
        }
      </div>
    </div>
  )
}




export const EditInfoModal = ({modalTitle, modalBody, className}:
  {modalTitle:[string, Dispatch<SetStateAction<string>>],
    modalBody:[JsonValue, Dispatch<SetStateAction<JsonValue>>],
    className: string 
   }) => {

  const [title, setTitle] = modalTitle
  const [body, setBody] = modalBody

  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [scrollBehavior] = useState<"inside" | "normal" | "outside" | undefined >("inside");

  return(
    <div className="flex flex-col gap-2">
      <Button className="p-2 w-36" onPress={onOpen}>Editar Modal</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior={scrollBehavior}
        classNames={{body: 'text-black '+className, header: 'text-black'}}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <Input type='text' value={title} onValueChange={setTitle} placeholder={'Título'} />
              </ModalHeader>
              <ModalBody>
                <RichTextEditor value={body} onValueChange={setBody} />
                {/* <Textarea value={body} onValueChange={setBody} placeholder="Conteúdo do Modal" />
                <Input type="image" alt={'no image'} /> */}
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

export const InfoModal = ({title, body, className}:{title:string, body:JsonValue, className?:string}) => {

  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [scrollBehavior] = useState<"inside" | "normal" | "outside" | undefined >("inside");

  return(
    <div className="flex flex-col gap-2">
      <Button onPress={onOpen}>{'Instrução'}</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior={scrollBehavior}
        classNames={{body: 'text-black '+className, header: 'text-black'}}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {title}
              </ModalHeader>
              <ModalBody>
                <RichTextEditor value={body} />
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

export function ProceduresTable(){

  const { procedures, setIsLoadingProceds, setEditProcedure, selectedCompany, selectedTicketType} = useProcedureContext()
  const [ready, setReady] = useState<boolean>(false) 
  const [procedure, setProcedure] = useState(procedures)

  const editSelectedRows = (id:number) => {    
    setProcedure((prev) => {
      return {...prev, items: prev.items.map(el => el.id ==id ? {...el, checked: !el.checked} : el)}
    })
  }

  const moveItem = (dir: string, proc:number) =>{
    setProcedure((prev) => {
      const ind = prev.items.findIndex(el => proc == el.id)
      const items = [...prev.items]
      if(dir == 'up'){
        [items[ind], items[ind == 0 ? 0 : ind-1]] = [items[ind == 0 ? 0 : ind-1], items[ind]]
      }else{
        [items[ind], items[ind == items.length-1 ? items.length-1 : ind+1]] = [items[ind == items.length-1 ? items.length-1 : ind+1], items[ind]]
      }
      return {...prev, items}
    })
  }

  useEffect(()=>{
    setReady(true)
  },[])

  useEffect(()=>{
    setProcedure(procedures)
  },[procedures])


  return (
    <>
      {
        ready && (
          <Table 
            aria-label="users"
            classNames={{wrapper:'overflow-auto h-120 h-max-2/3'}}
          >
            <TableHeader >
            <TableColumn>
              <Input type="checkbox" readOnly disabled />
            </TableColumn>
              <TableColumn key={'label'}>{'Nome'}</TableColumn>
              <TableColumn key={'input_type'}>{'Tipo de Input'}</TableColumn>
              <TableColumn key={'company_id'}>{'Empresa'}</TableColumn>
              <TableColumn key={'ticket_type_id'}>{'Tipo de Ticket'}</TableColumn>
              <TableColumn key={'edit'}>{'Editar'}</TableColumn>
              <TableColumn key={'move'}>{'Mover'}</TableColumn>
            </TableHeader>
            <TableBody items={procedure.items}>
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell key={item.id +'-check'}>
                    <Checkbox
                      isSelected={item.checked}
                      onChange={() => editSelectedRows(item.id)}
                    />
                  </TableCell>
                  <TableCell key={item.id +'label'}>{ item.label}</TableCell>
                  <TableCell key={item.id +'input_type'}>{ item.input_type}</TableCell>
                  <TableCell key={item.id +'company_id'}>{ item.company_id}</TableCell>
                  <TableCell key={item.id +'ticket_type_id'}>{ item.ticket_type_id}</TableCell>
                  <TableCell key={item.id +'edit'}><Button onPress={() => setEditProcedure(item.id)}>Editar</Button></TableCell>
                  <TableCell key={item.id +'move'}>
                    <div className="flex flex-col gap-1">
                      <Button className="py-1 h-4" onPress={() => moveItem('up', item.id )}><ArrowUpIcon className="h-3" /></Button>
                      <Button className="py-1 h-4" onPress={() => moveItem('down', item.id )}><ArrowDownIcon className="h-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )
      }
      <div className="flex flex-row gap-2"  >
        <Button
          className='w-60' 
          onPress={() => saveProcedure({company_id: selectedCompany ?? 0, ticket_type_id: selectedTicketType ?? 0, items: procedure.items})
          .then(() => {
              toast.success('salvo com sucesso')
              setIsLoadingProceds(true)
          })
            .catch(() => toast.error('deu algo de errado'))} >
            Ordenar Procedimentos
        </Button>
        <Button
          className='w-60' 
          onPress={() => deleteProcedure(procedure.id)
            .then(() => {
              toast.success('excluido com sucesso')
              setIsLoadingProceds(true)
          })
            .catch(() => toast.error('deu algo de errado'))} >
            Excluir Ordenamento
        </Button>
      </div>
    </>
  );
}

export function ProcedureEditor() {

  const [value, setValue] = useState<null | string >(null)
  const [procedureId, setProcedureId] = useState<number | undefined>(undefined)
  const {setIsLoadingProceds, selectedProcedure, selectedTicketType, selectedCompany, setSelectedCompany, setSelectedTicketType, setEditProcedure} = useProcedureContext()
  const [label, setLabel] = useState('')
  const [modalBody, setModalBody] = useState<JsonValue>('')
  const [modalTitle, setModalTitle] = useState('')

  useEffect(()=>{
    if(selectedProcedure){
      setProcedureId(selectedProcedure.id)
      setValue(selectedProcedure.input_type +'')
      setLabel(selectedProcedure.label)
      setModalTitle(selectedProcedure.modal_title ?? '')
      // @ts-expect-error: json is a string
      setModalBody(JSON.parse(selectedProcedure.modal_body))
      setSelectedCompany(selectedProcedure.company_id)
      setSelectedTicketType(selectedProcedure.ticket_type_id)
    }else{
      setProcedureId(0)
      setValue(null)
      setLabel('')
      setModalTitle('')
      setModalBody(null)
      setSelectedCompany(null)
      setIsLoadingProceds(false)
    }
  }, [selectedProcedure])

  return(
    <div className="border rounded border-primary p-2">
      <div className="flex flex-col pb-3 mb-3">
        <span className="pr-2">ID do procedimento: {procedureId}</span>
        <Autocomplete
          variant={'bordered'}
          aria-label={'Tipo de Input'}
          // isRequired={true}
          label={'Tipo de Input'}
          defaultItems={ticketTypeOptions}
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
          {ticketTypeOptions.map((item:{id:number, label: string}) => <AutocompleteItem key={item.id}>{item.label}</AutocompleteItem>)}
        </Autocomplete>
      </div>
      {
        value == '1' ?
        <RadioInput modalBody={[modalBody, setModalBody]} modalTitle={[modalTitle, setModalTitle]} label={[label, setLabel]} />
        :
        value == '2' ?
        <TextInput modalBody={[modalBody, setModalBody]} modalTitle={[modalTitle, setModalTitle]} label={[label, setLabel]} />
        :
        value == '3' ?
        <OptionsInput modalBody={[modalBody, setModalBody]} modalTitle={[modalTitle, setModalTitle]} label={[label, setLabel]} />
        :
        null
      }
      {
        !procedureId         
        ?
          <Button className="w-60 m-2" onPress={ async () => {
            const response = await createProcedureItem({
              company_id:  selectedCompany, 
              ticket_type_id: selectedTicketType, 
              label, 
              input_type: value ? parseInt(value+'') : 1, 
              modal_body:JSON.stringify(modalBody), 
              modal_title:modalTitle,
              id: procedureId
            })
            if(response.status == 'error'){
              toast.error(response.message)     
            }else if(response.status == 'success'){
              setIsLoadingProceds(true)
            toast.success(response.message)
            }
            }} 
          >
            Criar item de procedimento
          </Button>

        :
          <div className="flex flex-row py-2 gap-2">
            <Button className="w-60" onPress={ async () => {
              const response = await createProcedureItem({
                id: procedureId,
                company_id:  selectedCompany, 
                ticket_type_id: selectedTicketType, 
                label, 
                input_type: value? parseInt(value+'') : 1, 
                modal_body:JSON.stringify(modalBody), 
                modal_title:modalTitle
              })
              if(response.status == 'error'){
                toast.error(response.message)     
              }else if(response.status == 'success'){
                setProcedureId(undefined)
                setIsLoadingProceds(true)
              toast.success(response.message)
              }
              }} 
            >
              Salvar item de procedimento
            </Button>
            <Button  
            className='w-60 bg-danger' 
            onPress={() => deleteProcedureItem( [procedureId ?? 0])
              .then(() => {
                toast.success('deletado com sucesso')
                setProcedureId(undefined)
                setIsLoadingProceds(true)
            })
              .catch(() => toast.error('deu algo de errado'))} >
              Deletar Procedimento
          </Button>
            <Button  
            className='w-60' 
            onPress={() => {
              setProcedureId(undefined)
              setIsLoadingProceds(true)
              setEditProcedure(0)

            }}>
              voltar
          </Button>
        </div>
      }

    </div>
  )
}