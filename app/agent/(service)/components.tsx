"use client"

import { Card, CardBody, Autocomplete, AutocompleteItem, RadioGroup, Radio, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Textarea, Snippet } from "@nextui-org/react";
import Link from 'next/link'
import { ITicketContextData, IProcedureItemResponse, useTicketContext, parsePageInfo } from "@/app/agent/providers"
import { useState, useEffect, useCallback, ChangeEvent } from 'react'
import { Input } from "@nextui-org/react"
import { createMetroTicket } from '@/app/actions/api'
import { findOrCreateTicketTime, updateTicket } from "@/app/actions/ticket";
import { usePathname, useRouter } from 'next/navigation'
import { IProcedureItem, getProcedure } from "@/app/actions/procedures";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { RichTextEditor } from "@/app/lib/richTextEditor/richTextEditor";
import { JsonValue } from "@prisma/client/runtime/library";
import { ChevronRightIcon, ChevronLeftIcon, ClipboardIcon } from "@heroicons/react/24/solid"
import { z } from 'zod'
import { Ticket, Ticket_status } from "@prisma/client";
import { useTicketTypeContext } from "@/app/providers";



export const TextInput = ({ id, fieldName, label, isRequired = false, isLarge = false }:
  {
    id: string, label: string, isRequired?: boolean, isLarge?: boolean,
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
    <div className="flex flex-col rounded m-1 px-2 my-1 py-1">
      {
        !isLarge ?
          <Input
            type="text"
            maxLength={180}
            label={label}
            color={'primary'}
            classNames={{
              base: `h-18 w-full ml-4 `,
              inputWrapper: `bg-white justify-start w-full border border-primary rounded-medium`,
            }}
            value={value}
            onValueChange={setValue}
            isRequired={isRequired}
          />
          :
          <Textarea
            type="text"
            maxLength={800}
            label={label}
            color={'primary'}
            classNames={{
              base: `h-18 w-full ml-4 `,
              inputWrapper: `bg-white justify-start w-full border border-primary rounded-medium`,
            }}
            value={value}
            onValueChange={setValue}
            isRequired={isRequired}
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

export const ProcedureTextInput = ({ label, Modal, id = 0, isLarge = false }: { isInteractive?: boolean, label: string, Modal: React.ReactElement, id: number, isLarge?: boolean }) => {

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
      <Snippet hideSymbol className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1">
        <span className="bg-purple-700 text-white px-2">{label}</span>
      </Snippet>
      <div className="flex flex-row">
        {Modal}
        {
          isLarge ?
            <Input
              type="text"
              label={label}
              color={'primary'}
              classNames={{
                base: `w-144 h-16 ml-4 border border-primary rounded-medium`,
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
    <div>
      <Snippet hideSymbol className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1 rounded">
        <span>{label}</span>
      </Snippet>
      <RadioGroup
        orientation="horizontal"
        classNames={{ label: 'p-1 m-1 rounded ' + (isInteractive ? 'bg-purple-700 text-white' : 'border border-primary text-primary') }}
        value={response}
        onValueChange={setResponse}
      >
        {Modal}
        <Radio value="true" classNames={{ wrapper: 'border-success', control: 'bg-success' }}></Radio>
        <Radio value="false" classNames={{ wrapper: 'border-danger', control: 'bg-danger' }}></Radio>
      </RadioGroup>
    </div>
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
            <Timer />
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

export const IssueSelector = ({ id }: { id: string }) => {

  const { fatherTypes, childTypes } = useTicketTypeContext()
  const [filteredChildTypes, setFilteredChildTypes] = useState<IssueSelectorItem[]>([])
  const { ticketContext, setTicketContext, isMounted } = useTicketContext()
  const ticket = ticketContext.tickets.find(el => el.id == parseInt(id))
  const [fatherValue, setFatherValue] = useState<string>('0')
  const [childValue, setChildValue] = useState<string>(ticket ? ticket['type'] + '' : '0')

  useEffect(() => {
    if (isMounted) {
      const ticket = ticketContext.tickets.find(el => el.id == parseInt(id))
      if (ticket) {
        setFatherValue([...fatherTypes, ...childTypes]?.find(el => el.id == ticket.type)?.id_father + '')
        setChildValue(ticket.type ? ticket.type + `` : `0`)
      }
    }
  }, [isMounted])

  useEffect(() => {
    if(parseInt(fatherValue)){
      const childs = childTypes.filter(el => el.id_father == parseInt(fatherValue))
      setFilteredChildTypes(childs)
      
      if (childs.length == 0) {
        setChildValue(fatherValue)
      }
    }
  }, [fatherValue])


  useEffect(() => { 
    if (isMounted) {
      const newContext = {
        ...ticketContext, tickets: ticketContext.tickets.map(el =>
          el.id == parseInt(id) ? { ...el, type: parseInt(childValue) } : el)
      }
      setTicketContext(newContext)
    }
  }, [childValue])

  return (
    <div className="flex flex-row gap-2">
      <Autocomplete
        variant={'bordered'}
        aria-label={'Selecione o problema'}
        isRequired
        label=""
        // defaultItems={ticketTypeContext[issue]}
        placeholder={'Selecione o problema genérico'}
        defaultSelectedKey=""
        // @ts-expect-error: library has wrong type
        onSelectionChange={setFatherValue}
        selectedKey={fatherValue}
        className="flex h-11 max-w-xs my-1"
        classNames={{
          popoverContent: 'bg-zinc-500 border-primary border rounded-medium',
          base: 'flex shrink border-primary border rounded-medium'
        }}
      >
        {fatherTypes.map((item: { id: number, label: string }) => <AutocompleteItem key={item.id}>{item.label}</AutocompleteItem>)}
      </Autocomplete>
      {
        filteredChildTypes.length > 0 
          ?
          <Autocomplete
            variant={'bordered'}
            aria-label={'Selecione o sub problema'}
            isRequired
            label=""
            // defaultItems={ticketTypeContext[issue]}
            placeholder={'Selecione o problema específico'}
            defaultSelectedKey=""
            // @ts-expect-error: library has wrong type
            onSelectionChange={setChildValue}
            selectedKey={childValue}
            className="flex h-11 max-w-xs my-1"
            classNames={{
              popoverContent: 'bg-zinc-500 border-primary border rounded-medium',
              base: 'flex shrink border-primary border rounded-medium'
            }}
          >
            {filteredChildTypes.map((item: { id: number, label: string }) => <AutocompleteItem key={item.id}>{item.label}</AutocompleteItem>)}
          </Autocomplete>
        :
          null
      }
    </div>
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
  const [enabled, setEnabled] = useState(true)
  const [finishType, setFinishType] = useState(true)
  const [isFinished, setIsFinished] = useState(false)


  const finishAction = useCallback(async (isSolved: boolean) => {
    try {
      const validateFinishForm = (ticket: Ticket) => {
        try {
          finishSchema.parse(ticket);
          return true;
        } catch (err) {
          if (err instanceof z.ZodError) {
            err.errors.forEach(error => {
              if (error.message.includes("Expected")) {
                console.log(error);
                toast.error(`Preencha ${translateFinishFieldName(String(error.path[0]))} corretamente`);
                return;
              }
              toast.error(error.message);
            });
            console.error(err.errors.map(el => ({ message: el.message, item: el.path[0] })));
          }
        }
        return false;
      };

      const translateFinishFieldName = (fieldName: string) => {
        const translations: { [key: string]: string } = {
          erpProtocol: 'Protocolo ERP',
          communication_id: 'Protocolo Chat',
        };
        return translations[fieldName as string] || fieldName;
      };

      if (!ticket || !validateFinishForm(ticket)) {
        setEnabled(true);
        return;
      }

      const resp = await createMetroTicket(ticket, isSolved);

      if (resp?.status === 200 && ticket) {
        const newCtx = { ...ticketContext, tickets: ticketContext.tickets.filter(el => el.id !== ticket.id) };
        toast.success('Ticket criado no gestor com sucesso');
        setTicketContext(newCtx);
        setIsFinished(true)
      } else {
        toast.error(resp?.message ?? 'erro');
      }
    } catch (err) {
      console.error("Erro ao finalizar o ticket:", err);
      setEnabled(true)
    }

  }, [JSON.stringify(ticket), enabled]);

  useEffect(() => {
    if (isFinished) {
      router.push('/agent/' + ticket?.user_id);
    }
  }, [isFinished])

  useEffect(() => {
    if (!enabled) {
      finishAction(finishType)
    }
  }, [enabled])

  const onFinishClick = (type: boolean) => {
    setEnabled(false)
    setFinishType(type)
  }

  return (
    <div className="flex space-x-4">
      <Button onPress={() => onFinishClick(true)} type={"submit"} disabled={!enabled} className="bg-green-500 hover:bg-green-600 text-white font-bold" title="Resolvido">Resolvido</Button>
      <Button onPress={() => onFinishClick(false)} type={"submit"} disabled={!enabled} className="bg-red-500 hover:bg-red-600 text-white font-bold" title="Não resolvido">Não Resolvido</Button>
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
  const { childTypes } = useTicketTypeContext()

  const path = usePathname()
  const { ticket } = parsePageInfo(path, ticketContext)

  useEffect(() => {
    if (ticket) {
      const types = childTypes.find(el => el.id == ticket.type)
      getProcedure({ company_id: ticket.company_id, ticket_type_id: types?.id ?? 0, father_ticket_type_id: types?.id_father ?? 0 }).then(response => {
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
  type: z.number().positive('Selecione um tipo de ticket válido'),
  client_name: z.string().min(3, 'Insira um nome de cliente válido (min 3 car)'),
  caller_number: z.string().min(3, 'Insira um número de telefone válido (min 3 car)').max(14, 'Insira um número de telefone válido (max 14 car)'),
  caller_name: z.string().min(3, 'Insira um nome de solicitante válido (min 3 car)'),
  identity_document: z.string().min(3, 'Insira um CPF/CNPJ válido (min 3 car)'),
  subject: z.string().min(3, 'Insira um problema alegado válido (min 3 car)'),
});

const validateTriageForm = (ticket: Ticket) => {
  try {
    triageSchema.parse(ticket);
    return true;
  } catch (err) {
    if (err instanceof z.ZodError) {
      err.errors.forEach(error => {
        if (error.message.includes("Expected")) {
          console.log(error);
          toast.error(`Preencha ${translateFieldName(String(error.path[0])).toLowerCase()} corretamente`);
          return;
        }
        toast.error(error.message);
      });
      console.error(err.errors.map(el => ({ message: el.message, item: el.path[0] })));
    }
  }
  return false;
};

const translateFieldName = (fieldName: string) => {
  const translations: { [key: string]: string } = {
    type: 'Tipo de ticket',
    client_name: 'Nome do cliente',
    caller_number: 'Número de telefone',
    caller_name: 'Nome do solicitante',
    identity_document: 'CPF/CNPJ',
    subject: 'Problema alegado',
  };
  return translations[fieldName as string] || fieldName;
};

export const NavigateTicket = ({ direction, route }: { direction: string, route: string }) => {
  const { ticketContext } = useTicketContext();
  const router = useRouter();
  const path = usePathname()
  const { ticket } = parsePageInfo(path, ticketContext)

  const onClick = () => {
    if (ticket) {
      if (direction == `forwards`) {
        const isValid = validateTriageForm(ticket)
        if (!isValid) {
          return
        }
      }

      const nextStatus: Ticket_status = route.split('/')[2].includes(status as Ticket_status) ? route.split('/')[2] as Ticket_status : 'triage' as Ticket_status
      updateTicket({ ...ticket, status: nextStatus })
      router.push(route)
    }
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

export function PhoneInput({ id, fieldName, label }: { id: string; fieldName: keyof ITicketContextData['tickets'][0]; label: string }) {
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
    const localDigits = digits.length > 11 ? digits.slice(0, 11) : digits;
    if (localDigits.length <= 10) {
      return localDigits.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return localDigits.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  const handleChange = (val: string) => {
    const onlyDigits = val.replace(/\D/g, '');
    const localDigits = onlyDigits.length > 11 ? onlyDigits.slice(0, 11) : onlyDigits;
    setMaskedValue(formatPhone(localDigits));
    setTicketContext((prev) => {
      const updatedTickets = prev.tickets.map((t) =>
        t.id === parseInt(id) ? { ...t, [fieldName]: onlyDigits } : t
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

const formatTime = (time: number) => {
  return `${time / 60 < 9 ? '0' + Math.floor(time / 60) : Math.floor(time / 60)}:${time % 60 < 10 ? '0' + time % 60 : time % 60}`
}

const Timer = () => {

  const path = usePathname()
  const { ticketContext, setTicketContext, isMounted } = useTicketContext()
  const { ticket } = parsePageInfo(path, ticketContext)
  const currentStatus: Ticket_status = path.split('/')[2] as Ticket_status ?? 'triage' as Ticket_status
  const [time, setTime] = useState<number>(0)
  const [tick, setTick] = useState(false)

  const updateTimerContext = useCallback(() => {
    if (ticket) {
      const newTicket = { ...ticket, ticket_time: ticket.ticket_time ? ticket.ticket_time : [] }
      let isFound = false
      for (let i = 0; i <= ticket.ticket_time?.length; i++) {
        if (!isFound && i == ticket.ticket_time.length) {
          newTicket.ticket_time.push({ ticket_id: ticket.id, ticket_status: currentStatus, time })
          break
        }
        if (newTicket.ticket_time[i]?.ticket_status == currentStatus) {
          isFound = true
          newTicket.ticket_time[i] = { ...newTicket.ticket_time[i], time }
        }
      }

      setTicketContext({
        ...ticketContext, tickets: ticketContext.tickets.map(el =>
          el.id != ticket?.id ? el : newTicket)
      })
    }
  }, [time, ticketContext, ticket, currentStatus])

  useEffect(() => {
    const timer = ticket?.ticket_time?.find(el => el.ticket_status == currentStatus)

    if (timer) {
      setTime(timer.time)
    } else {
      findOrCreateTicketTime(ticket?.id ?? 0, currentStatus).then(el => {
        setTime(el.time)
      })
    }
    updateTimerContext()
    const intervalId = setInterval(() => setTick(true), 1000)

    return () => {
      clearInterval(intervalId);
    };
  }, [isMounted, path])

  useEffect(() => {
    if (tick) {
      setTime(time + 1)
      updateTimerContext()
      setTick(false)
    }
  }, [tick])


  return (
    <div className="flex flex-col">
      <p className="text-primary text-center">Interação na etapa</p>
      <p className="text-primary text-center">{formatTime(time)}</p>
    </div>

  )
}

// Funções auxiliares de formatação/validação
function formatCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatCNPJ(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,4})/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function isValidCPF(value: string): boolean {
  const cpf = value.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let firstCheck = 11 - (sum % 11);
  if (firstCheck >= 10) firstCheck = 0;
  if (firstCheck !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  let secondCheck = 11 - (sum % 11);
  if (secondCheck >= 10) secondCheck = 0;
  return secondCheck === parseInt(cpf[10]);
}

function isValidCNPJ(value: string): boolean {
  const cnpj = value.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const weightFirst = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weightFirst[i];
  }
  let firstCheck = sum % 11;
  firstCheck = firstCheck < 2 ? 0 : 11 - firstCheck;
  if (firstCheck !== parseInt(cnpj[12])) return false;

  const weightSecond = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weightSecond[i];
  }
  let secondCheck = sum % 11;
  secondCheck = secondCheck < 2 ? 0 : 11 - secondCheck;
  return secondCheck === parseInt(cnpj[13]);
}

export function DocumentInput({ id, fieldName, label, isRequired }: { id: string; fieldName: string; label: string; isRequired: boolean; }) {
  const [docType, setDocType] = useState<'cpf' | 'cnpj' | 'customerCode'>('cpf');
  const [docValue, setDocValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const { ticketContext, setTicketContext, isMounted } = useTicketContext();
  const [isCtxLoaded, setIsCtxLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isCtxLoaded && isMounted) {
      const ticket = ticketContext.tickets.find(el => el.id == parseInt(id));
      const initialValue = ticket ? (ticket as unknown as Record<string, string>)[fieldName] ?? '' : '';
      if (initialValue.length > 11) {
        setDocType('cnpj');
        const formattedValue = formatCNPJ(initialValue);
        setDocValue(formattedValue);
        setIsValid(isValidCNPJ(formattedValue));
        if (!isValidCNPJ(formattedValue)) {
          // Handle invalid CNPJ case here
        }
      } else {
        setDocType('cpf');
        const formattedValue = formatCPF(initialValue);
        setDocValue(formattedValue);
        setIsValid(isValidCPF(formattedValue));
        if (!isValidCPF(formattedValue)) {
          // Handle invalid CPF case here
        }
      }
      setIsCtxLoaded(true);
    }
  }, [JSON.stringify(ticketContext.tickets), fieldName, id, isCtxLoaded, isMounted]);

  const onTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'cpf' | 'cnpj' | 'customerCode';
    setIsValid(true);
    setDocType(newType);
  };

  const onValueChange = (val: string) => {
    let formatted = val;
    setIsValid(true);

    if (docType === 'cpf') {
      formatted = val.replace(/\D/g, '');
      formatted = formatCPF(formatted);
      if (formatted.length === 14) {
        setIsValid(isValidCPF(formatted));
      }
    } else if (docType === 'cnpj') {
      formatted = val.replace(/\D/g, '');
      formatted = formatCNPJ(formatted);
      if (formatted.length === 18) {
        setIsValid(isValidCNPJ(formatted));
      }
    }

    setDocValue(formatted);
    // Atualize o contexto com o valor bruto (apenas números para CPF/CNPJ)
    setTicketContext((prev) => {
      const updatedTickets = prev.tickets.map((t) =>
        t.id === parseInt(id) ? { ...t, [fieldName]: docType === 'customerCode' ? formatted : formatted.replace(/\D/g, '') } : t
      );
      return { ...prev, tickets: updatedTickets };
    });
  };

  return (
    <div className="flex flex-col rounded m-1 px-2 my-1 py-1">
      <div color={'primary'} className={`flex items-center border border-primary rounded-medium focus-within:ring-1 focus-within:ring-primary`}>
        <select
          value={docType}
          onChange={onTypeChange}
          className={`text-sm h-18 bg-white focus:outline-none w-2/5 px-2 rounded-l-medium whitespace-normal`}
          title="Selecione o tipo de documento"
        >
          <option value="cpf">CPF</option>
          <option value="cnpj">CNPJ</option>
          <option value="customerCode">Código do Cliente</option>
        </select>

        <Input
          value={docValue}
          onValueChange={onValueChange}
          label={label}
          isRequired={isRequired}
          color={'primary'}
          classNames={{
            base: `w-full h-18`,
            inputWrapper: "text-sm bg-white border-none rounded-none rounded-r-medium",
            input: "px-2",
            label: "text-foreground-700"
          }}
          placeholder={'Insira o documento'}
        />
      </div>
      <div className="text-xs mt-1 ml-2 h-18 flex items-center">
        {docType !== 'customerCode' && docValue.length >= (docType === 'cpf' ? 14 : 18) ? (
          <span className={isValid ? 'text-success' : 'text-danger'}>
            {isValid ? 'Documento válido' : 'Documento inválido'}
          </span>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>
    </div>
  );
}


