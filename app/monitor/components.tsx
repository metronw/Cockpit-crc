'use client'

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Autocomplete, AutocompleteItem, RadioGroup, Radio, Input, Button, useDisclosure, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { ArrowRightStartOnRectangleIcon, HomeIcon} from "@heroicons/react/24/solid"
import { toast } from "react-hot-toast";
import { createProcedure } from "@/app/actions/procedures";
import { signOut } from "next-auth/react";

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

export function InputPicker({companies, types}:{companies:Array<any>, types: Array<any>}){

  const [value, setValue] = useState(null)
  const [company, setCompany] = useState(null)
  const [ticketType, setTicketType] = useState(null)
  
  const [label, setLabel] = useState('')
  const [modalBody, setModalBody] = useState('')
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
          modal_body:modalBody, 
          modal_title:modalTitle
        })
        // const response = await createProcedure({company_id:company.id, ticket_type_id:ticketType.id, label: 'any', input_type: value ?? 1})
        if(response.status == 'error'){
          toast.error(response.message)     
        }else if(response.status == 'success'){
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
   modalBody:[string, Dispatch<SetStateAction<string>>] 
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
    modalBody:[string, Dispatch<SetStateAction<string>>],
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
                <Textarea value={body} onValueChange={setBody} placeholder="Conteúdo do Modal" />
                <Input type="image" alt={'no image'} />
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

export const InfoModal = ({title, body, className}:{title:string, body:string, className?:string}) => {

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
                {body}
                {/* <Input type="image" alt={'no image'} /> */}
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

export const MonitorHeader = ({id}: {id: number}) => {

  const router = useRouter()
  
  return (
    <div className='grid grid-cols-12'>
      <div className='col-span-3 pl-4'>
      <Button isIconOnly color="primary" aria-label="home" onPress={() => router.push('/agent/'+id)}>
        <HomeIcon />
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
      <Button className="" onPress={() => router.push('/monitor')}>Dashboard</Button>
      <Button className="" onPress={() => router.push('/monitor/scheduler')}>Agenda</Button>
    </div>
  )
}