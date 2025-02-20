import { BooleanInput, IssueSelector, NavigateTicket, PhoneInput, DocumentInput } from "../../components"
import { TextInput } from "../../components";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { use } from "react";
import { Snippet } from "@nextui-org/react";

async function nextPage() {
  'use server'
  return
}

export default function Triage({ params: { id } }: { params: { id: string } }) {
  const session = use(getServerSession(authOptions));
  return (
    <form action={nextPage} className="flex flex-col flex-stretch px-2 pt-2 mt-2 h-full grow justify-around">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4 my-1">
          <Snippet hideSymbol className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1"><span className="bg-purple-700 text-white rounded content-center text-wrap">{`Bom dia. Meu nome é ${session?.user.name.split(' ')[0]}, com quem falo?`}</span></Snippet>
          <TextInput id={id} fieldName={'caller_name'} label={'Nome do solicitante'} isRequired={true} />
          <TextInput id={id} fieldName={'subject'} label={'Problema alegado'} isLarge={true} isRequired={true} />

        </div>
        <div className="flex flex-col gap-4 my-1">
          <Snippet hideSymbol className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1">
            <span className="bg-purple-700 text-white rounded content-center text-wrap ">{`Pode me informar o nome do titular do contrato?`}</span>
          </Snippet>
          <TextInput id={id} fieldName={'client_name'} label={'Nome do cliente'} isRequired={true} />
          <Snippet hideSymbol className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1">
            <span className="bg-purple-700 text-white rounded content-center text-wrap">{`Como posso ajudá-lo?`}</span>
          </Snippet>
          <IssueSelector id={id} />
        </div>
      </div>
      <div className="flex flex-col gap-4">
      <Snippet hideSymbol className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1">
        <span className="bg-purple-700 text-white rounded content-center text-wrap ">Certo, vou só conferir alguns dados para confirmar o seu cadastro. </span>
      </Snippet>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="col-span-1 md:col-span-1">
            <DocumentInput id={id} fieldName={'identity_document'} label={'CPF/CNPJ'} isRequired={true} />
          </div>
          <div className="col-span-1 md:col-span-1">
            <PhoneInput id={id} fieldName={'caller_number'} label={'Telefone'} />
          </div>
          <BooleanInput id={id} fieldName={"isRecall"} label={`Rechamado?`} />
          <div className="col-span-1 md:col-span-2">
            <TextInput id={id} fieldName={'address'} label={'Endereço'} isLarge={true} />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-center mt-4">
        <NavigateTicket route={'/agent/procedure/' + id} direction={`forwards`} />
      </div>
    </form>
  );
}