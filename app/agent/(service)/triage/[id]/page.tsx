import { BooleanInput, IssueSelector, NavigateTicket, PhoneInput } from "../../components"
import { TextInput } from "../../components";
import { getCrcTicketTypes } from '@/app/actions/api';
import { getTicket } from "@/app/actions/ticket";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { use } from "react";

async function nextPage(formData: FormData) {
  'use server'
  console.log(formData)
  return
}

export default function Triage({ params: { id } }: { params: { id: string } }) {

  const session = use(getServerSession(authOptions));
  const ticket = use(getTicket(parseInt(id)))

  return (
    <form action={nextPage} className="flex flex-col flex-stretch px-4 pt-3 mt-4 h-full grow justify-around">

      <div className="flex gap-1 flex-col">
        <div className="flex flex row pr-4">
          <span className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1 ">{`Bom dia. Sou ${session?.user.name}, com quem falo?`}</span>
          <TextInput id={id} fieldName={'caller_name'} label={'Nome do solicitante'} isRequired={true} />

        </div>
        <div className="flex flex row pr-4">
          <TextInput id={id} fieldName={'subject'} label={'Problema alegado'} isLarge={true} isRequired={true} />
          <BooleanInput id={id} fieldName={"isRecall"} label={`Rechamado?`} />
        </div>
        <div className="flex flex row pr-4">
          <span className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1 ">{`Pode me informar o nome do titular do contrato?`}</span>
          <TextInput id={id} fieldName={'client_name'} label={'Nome do cliente'} isRequired={true} />
        </div>
        <div className="flex flex row pr-4 space-x-4">
          <span className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1">{`Como posso ajudá-lo?`}</span>
          <IssueSelector id={id} fieldName={'type'} placeholder={'Selecione o seu problema'} dataSource={getCrcTicketTypes} isRequired={true} />

          {/* Ticket Pai / Filho */}
        </div>
      </div>
      <div className="flex flex-col flex-wrap">
        <span className="bg-purple-700 text-white rounded content-center px-2 py-1 my-2 ">Certo, vou só conferir alguns dados para confirmar o seu cadastro. </span>
        <div className="flex flex-row flex-wrap gap-1">
          <div className="flex flex-row pr-4">
            <TextInput id={id} fieldName={'identity_document'} label={'CPF/CNPJ'} isRequired={true} />
          </div>
          <div className="flex flex-row pr-4">
            <PhoneInput id={id} fieldName={'caller_number'} label={'Telefone'} />
          </div>
          {/* <div className="flex flex row pr-4">
            <IssueSelector items={issueItems} placeholder={'Status do Contrato'}/>
          </div>
          <div className="flex flex row pr-4">
            <IssueSelector items={issueItems} placeholder={'Tipo de Plano'}/>
          </div> */}
        </div>
        <div className="flex flex-row pr-4">
          <TextInput id={id} fieldName={'address'} label={'Endereço'} isLarge={true} />
        </div>
      </div>
      <div className="flex flex-row justify-center">
        <NavigateTicket route={'/agent/procedure/' + id} direction={`forwards`} />
      </div>
    </form>
  );
}