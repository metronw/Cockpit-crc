"use client"

import { Card, CardBody, Autocomplete, AutocompleteItem, RadioGroup, Radio, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Textarea } from "@nextui-org/react";
import Link from 'next/link'
import { ILocalData, IProcedureItemResponse, useTicketContext } from "@/app/agent/providers"
import { useState, useEffect, useCallback } from 'react'
import { Input } from "@nextui-org/react"
import { createMetroTicket } from '@/app/actions/api'
import { updateTicket } from "@/app/actions/ticket";
import { usePathname, useRouter } from 'next/navigation'
import { IProcedureItem, getProcedure } from "@/app/actions/procedures";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { RichTextEditor } from "@/app/lib/richTextEditor/richTextEditor";
import { JsonValue } from "@prisma/client/runtime/library";
import { ChevronRightIcon, ChevronLeftIcon, ClipboardIcon } from "@heroicons/react/24/solid"
import { z } from 'zod'
import { Ticket } from "@prisma/client";

export const TextInput = ({ id, fieldName, label, isRequired = false, isLarge = false, validate = () => '' }:
  {
    id: string, label: string, isRequired?: boolean, isLarge?: boolean, validate?: (value: string) => string
    fieldName: 'client_name' | 'caller_number' | 'identity_document' | 'address' | 'erpProtocol' | `caller_name` | `communication_id` | 'subject'
  }) => {

  const { ticketContext, setTicketContext, isMounted } = useTicketContext()
  const [value, setValue] = useState<string>('')
  const [debouncedValue, setDebouncedValue] = useState<string>('')
  const [isCtxLoaded, setIsCtxLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (!isCtxLoaded && isMounted) {
      const ticket = ticketContext.tickets.find(el => el.id == parseInt(id))
      const initialValue = ticket ? ticket[fieldName] ?? '' : ''

      setValue(initialValue)
      setDebouncedValue(initialValue)
      setIsCtxLoaded(true)
    }

  }, [JSON.stringify(ticketContext.tickets), fieldName, id, isCtxLoaded, isMounted])

  useEffect(() => {
    if (isMounted) {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, 250); // Save only after 250ms of inactivity
      return () => {
        clearTimeout(handler);
      };
    }
  }, [value])

  useEffect(() => {
    if (isMounted) {
      setTicketContext((prevContext) => {
        const updatedTickets = prevContext.tickets.map((el) =>
          el.id === parseInt(id) ? { ...el, [fieldName]: debouncedValue } : el
        );
        return { ...prevContext, tickets: updatedTickets }
      });
    }

  }, [debouncedValue, id, fieldName])

  return (
    <div className="flex flex-col rounded m-1">
      {
        !isLarge ?
          <Input
            type="text"
            maxLength={30}
            label={label}
            color={'primary'}
            classNames={{
              base: `h-18 w-80 ml-4 `,
              inputWrapper: `bg-white justify-start w-76 border border-primary rounded-medium`,
            }}
            value={value}
            onValueChange={setValue}
            isRequired={isRequired}
            validate={validate}
          />
        :
        <Textarea
          type="text"
          maxLength={800}
          label={label}
          color={'primary'}
          classNames={{
            base: `h-18 w-144 ml-4 `,
            inputWrapper: `bg-white justify-start w-76 border border-primary rounded-medium`,
          }}
          value={value}
          onValueChange={setValue}
          isRequired={isRequired}
          validate={validate}
        />
      }
    </div>
  )
}

export function BooleanInput({ id, fieldName, label }: { id: string, fieldName: "isRecall", label: string }) {
  const { ticketContext, setTicketContext, isMounted } = useTicketContext()
  const [value, setValue] = useState<boolean>(false)
  const [isCtxLoaded, setIsCtxLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (!isCtxLoaded && isMounted) {
      const ticket = ticketContext.tickets.find(el => el.id == parseInt(id))
      const initialValue: boolean = ticket ? !!ticket[fieldName] : false

      setValue(initialValue ?? true)
      setIsCtxLoaded(true)
    }

  }, [ticketContext.tickets, fieldName, id, isCtxLoaded, isMounted])


  useEffect(() => {
    if (isCtxLoaded) {
      setTicketContext((prevContext) => {
        const updatedTickets = prevContext.tickets.map((el) =>
          el.id === parseInt(id) ? { ...el, [fieldName]: value } : el
        );
        return { ...prevContext, tickets: updatedTickets }
      });
    }

  }, [value])

  return (
    <div className="flex flex-row items-center gap-2 p-1">
      <span className="text-primary">{label}</span>
      <Checkbox type="checkbox"
        color={'primary'}
        classNames={{
          base: "w-6 h-6 text-primary ",
          wrapper: "border border-primary rounded-lg"
        }}
        isSelected={value}
        onValueChange={setValue}
      // onValueChange={(val) => setValue(newLocal ? true : false)}
      />

    </div>
  )
}

export const ProcedureTextInput = ({ label, Modal, id = 0, isLarge=false }: { isInteractive?: boolean, label: string, Modal: React.ReactElement, id: number, isLarge?:boolean }) => {

  const [value, setValue] = useState<string>('')
  const [response, setResponse] = useState<string>('')

  const { ticketContext, setTicketContext, isMounted } = useTicketContext()
  const path = usePathname()
  const { ticket } = parsePageInfo(path, ticketContext)

  useEffect(() => {
    if (ticket) {
      const procedures = JSON.parse(ticket.procedures ?? `[]`)
      const procedure = procedures.find((el: IProcedureItem) => el.id == id)
      if (procedure?.response) {
        setResponse(procedure.response)
        setValue(procedure.response)
      }
    }

  }, [])

  useEffect(() => {
    if (ticket && isMounted) {
      let procedures = JSON.parse(ticket.procedures ?? `[]`)
      if (procedures.find((el: IProcedureItem) => el.id == id)) {
        procedures = procedures.map((el: IProcedureItem) => el.id == id ? { ...el, response } : el)
      } else {
        procedures.push({ id, response, label })
      }
      const newTicket = ticketContext.tickets.map(el => el.id == ticket.id ? { ...el, procedures: JSON.stringify(procedures) } : el)
      setTicketContext({ ...ticketContext, tickets: newTicket })
    }
  }, [response, isMounted])

  useEffect(() => {
    const handler = setTimeout(() => {
      setResponse(value);
    }, 250); // Save only after 250ms of inactivity
    return () => {
      clearTimeout(handler);
    };
  }, [value])

  return (
    <div className="flex flex-col p-1  rounded m-2 gap-2">
      <span className="bg-purple-700 text-white px-2">{label}</span>
      <div className="flex flex-row">
        {Modal}
        {
          isLarge ?
          <Input
            type="text"
            label={label}
            color={'primary'}
            classNames={{ base: `w-144 h-16 ml-4 border border-primary rounded-medium`, 
              inputWrapper: `bg-white justify-start w-144 h-16`, input: `w-144 h-16 ` 
            }}
            value={value}
            onValueChange={setValue}
          />
          :
          <Textarea
            type="text"
            maxLength={500}
            label={label}
            color={'primary'}
            classNames={{
              base: `h-18 w-144 ml-4 `,
              inputWrapper: `bg-white justify-start w-76 border border-primary rounded-medium`,
            }}
            value={value}
            onValueChange={setValue}
        />
        }

      </div>

    </div>
  )
}

export const RadioInput = ({ isInteractive = false, label, Modal, id = 0 }: { isInteractive?: boolean, label: string, Modal: React.ReactElement, id: number }) => {

  const { ticketContext, setTicketContext, isMounted } = useTicketContext()
  const path = usePathname()
  const { ticket } = parsePageInfo(path, ticketContext)
  const [response, setResponse] = useState('')

  useEffect(() => {
    if (ticket) {
      const procedures = JSON.parse(ticket.procedures ?? `[]`)
      const procedure = procedures.find((el: IProcedureItem) => el.id == id)
      procedure?.response ? setResponse(procedure.response) : null
    }

  }, [])

  useEffect(() => {
    if (ticket && isMounted) {
      let procedures = JSON.parse(ticket.procedures ?? `[]`)
      if (procedures.find((el: IProcedureItem) => el.id == id)) {
        procedures = procedures.map((el: IProcedureItem) => el.id == id ? { ...el, response } : el)
      } else {
        procedures.push({ id, response, label })
      }
      const newTicket = ticketContext.tickets.map(el => el.id == ticket.id ? { ...el, procedures: JSON.stringify(procedures) } : el)
      setTicketContext({ ...ticketContext, tickets: newTicket })
    }
  }, [response, isMounted])


  return (
    <RadioGroup
      label={label} orientation="horizontal"
      classNames={{ label: 'p-1 m-1 rounded ' + (isInteractive ? 'bg-purple-700 text-white' : 'border border-primary text-primary') }}
      value={response}
      onValueChange={setResponse}
    >
      {Modal}
      <Radio value="true" classNames={{ wrapper: 'border-success', control: 'bg-success' }}></Radio>
      <Radio value="false" classNames={{ wrapper: 'border-danger', control: 'bg-danger' }}></Radio>
    </RadioGroup>
  )
}

export const InfoModal = ({ title, body }: { title: string, body: JsonValue }) => {

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [scrollBehavior] = useState<"inside" | "normal" | "outside" | undefined>("inside");

  return (
    <div className="flex flex-col gap-2">

      <Button onPress={onOpen}>{'Instrução'}</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior={scrollBehavior}
        classNames={{ body: 'text-black', header: 'text-black' }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {title}
              </ModalHeader>
              <ModalBody>
                {
                  // @ts-expect-error: Temporary mismatch
                  <RichTextEditor value={JSON.parse(body)} />
                }
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

function parsePageInfo(path: string, ticketCtx: ILocalData) {
  const pathName = path.split('/')
  const ticketId = parseInt(pathName[pathName.length - 1])

  const ticket: Ticket | undefined = ticketCtx.tickets.find(el => el.id == ticketId)
  const company = ticketCtx.companies.find(el => el.id == ticket?.company_id)

  return ({ company, ticket })
}

export const StagePanel = () => {
  const pathName = usePathname().split('/')
  const stageId = pathName[pathName.length - 2]

  let stageName = ''
  switch (stageId) {
    case 'triage':
      stageName = 'Triagem'
      break
    case 'procedure':
      stageName = 'Procedimento'
      break
    case 'finish':
      stageName = 'Finalização'
      break
  }

  const { ticketContext } = useTicketContext()
  const path = usePathname()
  const { company, ticket } = parsePageInfo(path, ticketContext)

  return (
    <div className='col-span-8 bg-white flex flex-row p-1 space-x-2 justify-center'>
      <Card className="border border-primary">
        <CardBody><p className="text-primary text-center">{company?.fantasy_name ?? ''}</p><p className="text-primary text-center font-bold">Ticket #{ticket?.id ?? ''}</p></CardBody>
      </Card>
      <div className="flex flex-row space-x-1">
        <Card className="border border-primary">
          <CardBody>
            <p className="text-center text-primary">Tipo do atendimento:</p>
            <p className="text-primary min-w-24 text-center justify-center font-bold text-lg">{ticket?.communication_type == `phone` ? `Telefônico` : ticket?.communication_type == `chat` ? `Chat` : ``}</p>
          </CardBody>
        </Card>
        <Card className="border border-primary">
          <CardBody>
            <p className="text-center text-primary">Etapa do atendimento:</p>
            <p className="font-bold text-primary text-center">{stageName.toUpperCase()}</p>
          </CardBody>
        </Card>
        <Card className="border border-primary">
          <CardBody>
            <p className="text-primary text-center">Interação na etapa</p>
            <p className="text-primary text-center">00:00</p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}


export const ServiceNavBar = () => {

  const tabs = [
    {
      id: "triage",
      label: "Triagem",
    },
    {
      id: "procedure",
      label: "Procedimento"
    },
    {
      id: "finish",
      label: "Finalizar"
    }
  ];

  return (
    <div className='flex flex-row space-x-4 text-lg justify-center bg-zinc-400 py-1  mb-2 '>
      {tabs.map(el =>
        <Link href={'/agent/' + el.id} key={el.id}>
          <Card className=" hover:border hover:border-2 hover:bg-primary border-zinc-700">
            <CardBody><p className="text-primary hover:text-white">{el.label + '  >> '} </p></CardBody>
          </Card>
        </Link>
      )}
    </div>
  )
}

interface IssueSelectorItem {
  id: number, 
  label: string
}

export const IssueSelector = ({ id, fieldName, placeholder, dataSource, isRequired = true }: { id: string, fieldName: 'type' | 'status', placeholder: string, dataSource: () => Promise<IssueSelectorItem[]>, isRequired: boolean }) => {

  const [items, setItems] = useState<IssueSelectorItem[]>([])
  const { ticketContext, setTicketContext, isMounted } = useTicketContext()
  const ticket = ticketContext.tickets.find(el => el.id == parseInt(id))
  const [value, setValue] = useState<string>(ticket ? ticket[fieldName] + '' : '')
  const [isCtxLoaded, setIsCtxLoaded] = useState<boolean>(false)

  useEffect(() => {
    dataSource().then((data: IssueSelectorItem[]) => {
      setItems(data)
    })
  }, [dataSource])

  useEffect(() => {
    if (isMounted && !isCtxLoaded) {
      const ticket = ticketContext.tickets.find(el => el.id == parseInt(id))
      if (ticket) {
        setIsCtxLoaded(true)
        setValue(ticket[fieldName] ? ticket[fieldName] + `` : ``)
      }
    }
  }, [isMounted, isCtxLoaded, JSON.stringify(ticketContext)])


  useEffect(() => {
    if (isMounted) {
      const newContext = { ...ticketContext, tickets: ticketContext.tickets.map(el => el.id == parseInt(id) ? { ...el, [fieldName]: parseInt(value) } : el) }
      setTicketContext(newContext)
    }
  }, [value])

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
      {items.map((item: { id: number, label: string }) => <AutocompleteItem key={item.id}>{item.label}</AutocompleteItem>)}
    </Autocomplete>
  );
}

const finishSchema = z.object({
  erpProtocol: z.string().min(3, 'O ticket deve ter um protocolo ERP'),
  communication_id: z.string().min(3, 'O ticket deve ter um protocolo de chat')
})

export const FinishButton = () => {
  const { ticketContext, setTicketContext } = useTicketContext();
  const path = usePathname();
  const { ticket } = parsePageInfo(path, ticketContext);
  const router = useRouter();

  const finishAction = useCallback(async () => {
    try {
      finishSchema.parse(ticket);
      console.log("Ticket validado:", ticket);

      const resp = await createMetroTicket(ticket);
      console.log("Resposta da criação do ticket:", resp);

      if (resp.status === 200 && ticket) {
        const newCtx = { ...ticketContext, tickets: ticketContext.tickets.filter(el => el.id !== ticket.id) };
        toast.success('Ticket criado no gestor com sucesso');
        setTicketContext(newCtx);
        console.log("Contexto atualizado:", newCtx);

        // Wait for the context to update before navigating
        setTimeout(() => {
          const userId = ticket.user_id; // try to fix the glitch
          router.push('/agent/' + userId);
          console.log("Redirecionando para /agent/" + userId);
        }, 100);
      } else {
        toast.error(resp.message);
      }
    } catch (err) {
      console.log("Erro ao finalizar o ticket:", err);
    }
  }, [JSON.stringify(ticket)]);

  return (
    <div className="flex space-x-4">
      <Button onPress={finishAction} type={"submit"} className="bg-green-500 hover:bg-green-600 text-white font-bold" title="Resolvido">Resolvido</Button>
      <Button onPress={finishAction} type={"submit"} className="bg-red-500 hover:bg-red-600 text-white font-bold" title="Não resolvido">Não Resolvido</Button>
    </div>
  );
};

function formatProcedures(procedures: string) {
  if (procedures) {
    const resp = JSON.parse(procedures).map((el: IProcedureItemResponse) => {
      return <span className="break-words text-wrap" key={el.id}>{'   ' + el.label} {el.response === 'true' ? 'Sim' : (el.response === 'false' ? 'Não' : el.response)} </span>
    })

    return resp
  }
  return ""
}

export const TicketSummary = () => {
  const { ticketContext } = useTicketContext();
  const path = usePathname();
  const { company, ticket } = parsePageInfo(path, ticketContext);
  const session = useSession();

  function formatPhoneNumber(raw: string) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 10) {
      return digits.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return digits.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  return (
    <Card className="border border-primary px-4 py-3 relative bg-purple-700 text-white">
      <button onClick={() => copyToClipboard()} className="absolute top-2 right-2" title="Copy to clipboard">
        <ClipboardIcon className="h-6 w-6 text-white" />
      </button>
      <div id="ticket-summary" className="break-words text-wrap w-full flex flex-col">
      <span>Empresa: {company?.fantasy_name}{ticket?.isRecall == true ? " RECHAMADO" : ""} </span>
      <span>Nome de Assinante: {ticket?.client_name}</span>
      <span>Tipo de atendimento: {ticket?.communication_type == `phone` ? 'Telefônico' : 'Chat'}</span>
      <span>Nome do solicitante: {ticket?.caller_name}</span>
      <span>Endereço: {ticket?.address}</span>
      <span>Problema alegado: {ticket?.subject}</span>
      {ticket?.procedures && <span>Procedimentos realizados:</span>}
      <div className="flex flex-col">
        {formatProcedures(ticket?.procedures ?? "")}
      </div>
      <span>Data/Horário: {(new Date(ticket?.createdAt ?? '')).toLocaleString()}</span>
      <span>Telefone: {ticket?.caller_number ? formatPhoneNumber(ticket.caller_number) : ''}</span>
      <span>Protocolo ERP: {ticket?.erpProtocol}</span>
      {ticket?.communication_type === 'chat' && <span>Protocolo Chat: {ticket.communication_id}</span>}
      <span>Atendente: {session?.data?.user.name}</span>
      </div>
    </Card>
  );
};

const copyToClipboard = () => {
  const summaryElement = document.getElementById('ticket-summary');
  if (summaryElement) {
    const range = document.createRange();
    range.selectNode(summaryElement);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    document.execCommand('copy');
    window.getSelection()?.removeAllRanges();
  }
};

export const Procedures = () => {
  const { ticketContext } = useTicketContext()
  const [procedures, setProcedures] = useState<Array<IProcedureItem> | null>(null)

  const path = usePathname()
  const { ticket } = parsePageInfo(path, ticketContext)

  useEffect(() => {
    if (ticket) {
      getProcedure({ company_id: ticket.company_id, ticket_type_id: ticket.type }).then(response => {
        const parsed = response.items.filter((el: IProcedureItem) => el.checked)
        setProcedures(parsed)
      })
    }
  }, [])

  return (
    <div className="w-full max-h-96 overflow-auto my-2">
      {
        procedures ?
          procedures.map(el => {
            if (el.input_type == 1) {
              return (
                <RadioInput key={el.id} isInteractive={true} label={el.label} Modal={<InfoModal title={el.modal_title ?? ''} body={el.modal_body ?? ''} />} id={el.id} />
              )
            } else if (el.input_type == 2) {
              return (
                <ProcedureTextInput key={el.id} label={el.label} id={el.id} isLarge={true} Modal={<InfoModal title={el.modal_title ?? ''} body={el.modal_body ?? ''} />} />
              )
            }
          })
          :
          null
      }
    </div>
  )
}

const triageSchema = z.object({
  type: z.number().positive('Selecione um tipo de ticket'),
  client_name: z.string().min(3, 'Insira um nome de cliente valido'),
  // communication_id: z.string().min(3, 'Insira um protocolo de chat valido'),
  caller_number: z.string().min(3, 'Insira um protocolo de chat valido'),
  identity_document: z.string().min(3, 'Insira um cpf/cnpj valido'),
})

const validateTriageForm = (ticket: Ticket) => {

  try {
    triageSchema.parse(ticket)
    return true
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err.errors.map(el => ({ message: el.message, item: el.path[0] })))
    }
  }
  return false
}



export const NavigateTicket = ({ direction, route }: { direction: string, route: string }) => {
  const { ticketContext } = useTicketContext();
  const router = useRouter();
  const path = usePathname()
  const { ticket } = parsePageInfo(path, ticketContext)


  const onClick = () => {
    if (direction == `forwards` && ticket) {
      const isValid = validateTriageForm(ticket)
      if (!isValid) {
        return
      }
    }
    updateTicket({ ticket })
    router.push(route)
  }

  return (
    <div >
      {
        direction == `backwards` ?
          <Button onPress={onClick} className="text-primary p-4">
            <ChevronLeftIcon width='40' /> Anterior
          </Button>
          :
          <Button type='submit' onPress={onClick} className="text-primary p-4 " >
            Próximo <ChevronRightIcon width='40' />
          </Button>
      }
    </div>
  )
}

export function PhoneInput({ id, fieldName, label }: { id: string; fieldName: keyof ILocalData['tickets'][0]; label: string }) { 
  const { ticketContext, setTicketContext, isMounted } = useTicketContext();
  const [maskedValue, setMaskedValue] = useState('');

  useEffect(() => {
    if (isMounted) {
      const ticket = ticketContext.tickets.find((t) => t.id === parseInt(id));
      if (ticket?.[fieldName]) {
        setMaskedValue(formatPhone(ticket[fieldName] as string));
      }
    }
  }, [JSON.stringify(ticketContext.tickets), isMounted]);

  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, '');
    const localDigits = digits.length > 11 ? digits.slice(-11) : digits;
    if (localDigits.length <= 10) {
      return localDigits.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return localDigits.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  const handleChange = (val: string) => {
    const onlyDigits = val.replace(/\D/g, '');
    const localDigits = onlyDigits.length > 11 ? onlyDigits.slice(-11) : onlyDigits;
    setMaskedValue(formatPhone(localDigits));
    setTicketContext((prev) => {
      const updatedTickets = prev.tickets.map((t) =>
        t.id === parseInt(id) ? { ...t, [fieldName]: localDigits } : t
      );
      return { ...prev, tickets: updatedTickets };
    });
  };

  
  return (
    <div className="flex flex-col m-1 gap-1">
      <Input
        isRequired
        type="text"
        label={label}
        color="primary"
        classNames={{
          base: `h-18 w-80 ml-4 `,
          inputWrapper: `bg-white justify-start w-76 border border-primary rounded-medium`,
        }}
        value={maskedValue}
        onValueChange={handleChange}
        maxLength={20}
      />
    </div>
  );
}
