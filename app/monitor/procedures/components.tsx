'use client'

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Autocomplete, AutocompleteItem, RadioGroup, Radio, Input, Button, useDisclosure, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { createProcedure, deleteProcedure } from "@/app/actions/procedures";
import { ICompany } from "@/app/agent/providers";
import { ITIcketType } from "@/app/providers";
import { useProcedureContext } from "./providers";
import { RichTextEditor } from "@/app/lib/richTextEditor/richTextEditor";
import { JsonValue } from "@prisma/client/runtime/library";



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



export function InputPicker({companies, types}:{companies:Array<ICompany>, types: Array<ITIcketType>}){

  const {setIsLoadingProceds} = useProcedureContext()

  const [value, setValue] = useState(null)
  const [company, setCompany] = useState(null)
  const [ticketType, setTicketType] = useState(null)
  
  const [label, setLabel] = useState('')
  const [modalBody, setModalBody] = useState<JsonValue>('')
  const [modalTitle, setModalTitle] = useState('')
  // const [modalMedia, setModalMedia] = useState('')

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Autocomplete
          variant={'bordered'}
          aria-label={'Tipo de Input'}
          // isRequired={true}
          label={'Tipo de Input'}
          defaultItems={options}
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
          {options.map((item:{id:number, label: string}) => <AutocompleteItem key={item.id}>{item.label}</AutocompleteItem>)}
        </Autocomplete>

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
          {types.map((item:{id:number, label: string}) => <AutocompleteItem key={item.id}>{item.label}</AutocompleteItem>)}
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
      
      {
        value == 1 ?
        <RadioInput modalBody={[modalBody, setModalBody]} modalTitle={[modalTitle, setModalTitle]} label={[label, setLabel]} />
        :
        value == 2 ?
        <TextInput/>
        :
        null
      }
      <Button className="w-40" onPress={ async () => {
        const response = await createProcedure({
          company_id: company ? parseInt(company) : null, 
          ticket_type_id: ticketType ? parseInt(ticketType) : null, 
          label, 
          input_type: value? parseInt(value) : 1, 
          modal_body:JSON.stringify(modalBody), 
          modal_title:modalTitle
        })
        if(response.status == 'error'){
          toast.error(response.message)     
        }else if(response.status == 'success'){
          setIsLoadingProceds(true)
         toast.success(response.message)
        }
        }} 
      >
        Criar procedimento
      </Button>
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
      <div className="flex flex-row gap-2">
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

export function TextInput ({  Modal }: {Modal?: React.ReactElement}) {
  const [response, setResponse] = useState('')
  const [procedure, setProcedure] = useState('')

  
  return(
    <div className="flex flex-col gap-2 ">      
      <Input 
        label={'label'}
        type='text' 
        value={procedure} 
        color={'primary'}  
        className={'w-80 h-11 border border-primary rounded-medium'}
        onValueChange={setProcedure}
      />
      {Modal}
      <span>Preview</span>
      <div className="border border-primary p-3 rounded">
        <Input 
          label={procedure}
          type='text' 
          value={response} 
          color={'primary'}  
          className={'w-80 h-11 border border-primary rounded-medium'}
          onValueChange={setResponse}
        />
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
      <Button onPress={onOpen}>Editar Modal</Button>
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

const procedureColumns = [
  {
    key: 'label',
    label: 'Nome'
  },
  {
    key: 'input_type',
    label: 'Tipo de input'
  },
  {
    key: 'company_id',
    label: 'Empresa'
  },
  {
    key: 'ticket_type_id',
    label: 'Tipo de ticket'
  }
]

export function ProceduresTable(){

  const {  procedures, setIsLoadingProceds} = useProcedureContext()

  // const [procedures, setProcedures] = useState([])
  const [ready, setReady] = useState<boolean>(false)

  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  // const [userFilter, setUserFilter] = useState('');
  // const [companyFilter, setCompanyFilter] = useState('');

  
  // useEffect(()=>{
  //   const newAssign = assignments?.filter(el => el.user.name.toLowerCase().includes(userFilter.toLowerCase()) && el.companyName.toLowerCase().includes(companyFilter.toLowerCase()) )
  //   setFormattedAssignments(newAssign?.map(el => ({...el, userName:el.user.name})))
  // },[userFilter, companyFilter, assignments])
 
  useEffect(()=>{
    setReady(true)
  },[])

  return (
    <>
      {/* <div className="flex flex-row gap-2 my-2">        
        <Input type='text' label='usuário' placeholder='filtro de usuário' value={userFilter} onValueChange={setUserFilter}></Input>
        <Input type='text' label='empresa' placeholder='filtro de empresa' value={companyFilter} onValueChange={setCompanyFilter}></Input>
      </div> */}
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
            <TableHeader columns={procedureColumns}>
              {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            <TableBody items={procedures}>
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
          onPress={() => deleteProcedure( Array.from(selectedKeys).map(el => parseInt(el)))
            .then(() => {
              toast.success('deletado com sucesso')
              setIsLoadingProceds(true)
          })
            .catch(() => toast.error('deu algo de errado'))} >
            Deletar Atribuições
        </Button>
    </>
  );
}