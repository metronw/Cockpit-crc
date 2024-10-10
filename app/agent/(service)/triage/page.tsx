import {IssueSelector} from "../components"
import {Input, Tooltip, Divider} from "@nextui-org/react"
import {ChevronRightIcon, ChevronLeftIcon} from "@heroicons/react/24/solid"

export default function Triage() {

  const issueItems = [{id: 'sem conect', label:"Sem conexão"}, {id: 'break', label: 'Quebra'}]
  
  return (
    <div className="flex flex-col flex-stretch px-4 pt-3 mt-8 h-full grow justify-around">        
      <div className="flex gap-1 flex-col">
        <div className="flex flex row pr-4">
          <span className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1 ">{`{Provedor}, {Saudação}. Meu nome é {agent.name}, em que posso ajudá-lo?`}</span>
          <Input type="text" label="nome" color={'primary'}  className={'w-80 h-11 ml-4 border border-primary rounded-medium'}/>
        </div>
        <div className="flex flex row pr-4 space-x-4">
          <span className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1">{`Como posso ajudá-lo?`}</span>
          <IssueSelector items={issueItems} placeholder={'Selecione o seu problema'}/>
        </div>
        <span className="bg-purple-700 text-white rounded content-center px-2 py-1 my-2 ">Certo, vou só conferir alguns dados para confirmar o seu cadastro. </span>
      </div>
      <div className="flex flex-row flex-wrap py-4 gap-1">
        <div className="flex flex row pr-4">
          <Input type="text" label="CPF" variant={'bordered'} color={'primary'} className={'w-40 h-11 border border-primary rounded-medium'}/>
        </div>
        <div className="flex flex row pr-4">
          <Input type="text" label="Telefone com DDD" variant={'bordered'} color={'primary'} className={'w-40 h-11 border border-primary rounded-medium'}/>
        </div>
        <div className="flex flex row pr-4">
          <IssueSelector items={issueItems} placeholder={'Status do Contrato'}/>
        </div>
        <div className="flex flex row pr-4">
          <IssueSelector items={issueItems} placeholder={'Tipo de Problema'}/>
        </div>
        <Input type="text" label="Endereço Completo" color={'primary'} className={'w-4/6 h-11 border border-primary rounded-medium'}/>
        <Input type="checkbox" label="Rechamado?" color={'primary'} className={'w-80 h-11 pl-4'}/>
        <div className="flex flex row px-2 pr-4">
        </div>
      </div>
      <div className="flex flex-row justify-center">
        {/* <Input type="button" label="Voltar" color={'primary'} className={'w-40'} startContent={<ChevronLeftIcon width='40' />}/>         */}
        <Input type="button" label="Próximo" color={'primary'} className={'w-40'} startContent={<ChevronRightIcon width='40' />} />
      </div>
    </div>
  );
}