import {IssueSelector} from "../../components"
import {Input} from "@nextui-org/react"
import {ChevronRightIcon} from "@heroicons/react/24/solid"
import { TextInput } from "../../components";
import Link from "next/link";
import {getCrcTicketTypes} from '@/app/actions/api';

export default function Triage({params: {id}}: {params: {id: number}}) {
  
  return (
    <form className="flex flex-col flex-stretch px-4 pt-3 mt-8 h-full grow justify-around">        
    
      <div className="flex gap-1 flex-col">
        <div className="flex flex row pr-4">
          <span className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1 ">{`{Provedor}, {Saudação}. Meu nome é {agent.name}, em que posso ajudá-lo?`}</span>
          <TextInput id={id} fieldName={'client_name'} label={'Nome do cliente'}/>
        </div>
        <div className="flex flex row pr-4 space-x-4">
          <span className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1">{`Como posso ajudá-lo?`}</span>
          <IssueSelector id={id} fieldName={'issue'} placeholder={'Selecione o seu problema'} dataSource={getCrcTicketTypes}/>
        </div>
        <span className="bg-purple-700 text-white rounded content-center px-2 py-1 my-2 ">Certo, vou só conferir alguns dados para confirmar o seu cadastro. </span>
      </div>
      <div className="flex flex-row flex-wrap py-4 gap-1">
        <div className="flex flex row pr-4">
          <TextInput id={id} fieldName={'cpf'} label={'CPF'} />
          {/* <Input type="text" label="CPF" variant={'bordered'} color={'primary'} className={'w-40 h-11 border border-primary rounded-medium'}/> */}
        </div>
        <div className="flex flex row pr-4">
          <TextInput id={id} fieldName={'phone'} label={'Telefone'} />
          {/* <Input type="text" label="Telefone com DDD" variant={'bordered'} color={'primary'} className={'w-40 h-11 border border-primary rounded-medium'}/> */}
        </div>
        {/* <div className="flex flex row pr-4">
          <IssueSelector items={issueItems} placeholder={'Status do Contrato'}/>
        </div>
        <div className="flex flex row pr-4">
          <IssueSelector items={issueItems} placeholder={'Tipo de Plano'}/>
        </div> */}
        <TextInput id={id} fieldName={'address'} label={'Endereço'}/>
        <Input type="checkbox" label="Rechamado?" color={'primary'} className={'w-80 h-11 pl-4'}/>
        <div className="flex flex row px-2 pr-4">
        </div>
      </div>
      <div className="flex flex-row justify-center">
        <Link href={'/agent/procedure/'+id}>Próximo <ChevronRightIcon width='40' /></Link>
        {/* <Input type="submit" label="Próximo" color={'primary'} className={'w-40'} startContent={<ChevronRightIcon width='40' />} /> */}
      </div>
    </form>
  );
}