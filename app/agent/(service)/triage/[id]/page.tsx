import {BooleanInput, IssueSelector, NavigateTicket} from "../../components"
import { TextInput } from "../../components";
import { getCrcTicketTypes} from '@/app/actions/api';
import { getTicket } from "@/app/actions/ticket";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { use } from "react";

export default function Triage({params: {id}}: {params: {id: string}}) {
  
  const session = use(getServerSession(authOptions));
  const ticket = use(getTicket(parseInt(id)))

  return (
    <form className="flex flex-col flex-stretch px-4 pt-3 mt-8 h-full grow justify-around">        
    
      <div className="flex gap-1 flex-col">
        <div className="flex flex row pr-4">
          <span className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1 ">{` Bom dia. Meu nome é ${session?.user.name}, com quem eu falo?`}</span>
          <TextInput id={id} fieldName={'caller_name'} label={'Nome do solicitante'} />
        </div>
        <div className="flex flex row pr-4">
          {/* <span className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1 ">{` ?`}</span> */}
          {
            ticket?.communication_type == `phone` ?
            null :
            <TextInput id={id} fieldName={'communication_id'} label={'Protocolo de atendimento'} />
          }
          <BooleanInput id={id} fieldName={"isRecall"} label={`Rechamado?`} />
        </div>
        {/* <Input type="checkbox" label="Rechamado?" color={'primary'} className={'w-32 h-16 pl-4'}/> */}
        <div className="flex flex row pr-4">
          <span className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1 ">{`Pode me informar o nome do titular do contrato?`}</span>
          <TextInput id={id} fieldName={'client_name'} label={'Nome do cliente'} />
        </div>
        <div className="flex flex row pr-4 space-x-4">
          <span className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1">{`Como posso ajudá-lo?`}</span>
          <IssueSelector id={id} fieldName={'type'} placeholder={'Selecione o seu problema'} dataSource={getCrcTicketTypes} isRequired={true}/>
        </div>
      </div>
      <div className="flex flex-col flex-wrap gap-1">
        <span className="bg-purple-700 text-white rounded content-center px-2 py-1 my-2 ">Certo, vou só conferir alguns dados para confirmar o seu cadastro. </span>
        <div className="flex flex-row flex-wrap gap-1">
          <div className="flex flex row pr-4">
            <TextInput id={id} fieldName={'identity_document'} label={'CPF/CNPJ'} />
          </div>
          <div className="flex flex row pr-4">
            <TextInput id={id} fieldName={'caller_number'} label={'Telefone'} />
          </div>
          {/* <div className="flex flex row pr-4">
            <IssueSelector items={issueItems} placeholder={'Status do Contrato'}/>
          </div>
          <div className="flex flex row pr-4">
            <IssueSelector items={issueItems} placeholder={'Tipo de Plano'}/>
          </div> */}
          <TextInput id={id} fieldName={'address'} label={'Endereço'}/>
          
          <div className="flex flex row px-2 pr-4">
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-center">
        <NavigateTicket route={'/agent/procedure/'+id} direction={`forwards`} />
      </div>
    </form>
  );
}