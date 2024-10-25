import {Input, Snippet} from "@nextui-org/react"
import { ChevronLeftIcon} from "@heroicons/react/24/solid"

export default function Procedure({params: {id}}: {params: {id: number}}) {
  
  return (
    <div className="flex flex-col pt-3 h-full">    
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-6 flex flex-col mx-4 gap-4">
          <p className='bg-purple-700 text-white rounded content-center px-2 my-1 py-1'>
            {"Solicitante, foi aberto um atendimento de protocolo [protocolo ERP] para o setor responsável. O prazo de retorno é "}
          </p>
          <div className="border rounded border-warning p-2 my-2">
            <p className="text-warning">Prazo Financeiro/Comercial: Até proximo dia útil</p>
            <p className="text-warning">Prazo técnico: Dois dias úteis para retorno telefônico</p>
          </div>
          <p className='bg-purple-700 text-white rounded content-center px-2 my-1 py-1'>
            {"Poderia te auxiliar em algo mais?"}
          </p>
          <p className='bg-purple-700 text-white rounded content-center px-2 my-1 py-1'>
            {"Agradecemos o seu contato! Tenha uma ótima tarde e boa semana!"}
          </p>

        </div>
        <div className="col-span-5 h-full">
          <Snippet  size="md" symbol={""} classNames={{base: 'border border-primary px-4 text-priamry py-3'}}>
            <p>Nome de Assinante:</p>
            <p>Tipo de atendimento: </p>
            <p>Nome do solicitante: </p>
            <p>Endereço:</p>
            <p>Problema alegado</p>
            <p>Procedimentos Realizados</p>
            <p>Data/Horário</p>
            <p>Melhor horário para retorno</p>
            <p>Telefone</p>
            <p>Protocolo</p>
            <p>Protocolo Chat</p>
            <p>Atendente</p>
          </Snippet>
        </div>
        
      </div>    
      <div className="flex flex-row justify-center ">
        <Input type="button" label="Voltar" color={'primary'} className={'w-40'} startContent={<ChevronLeftIcon width='40' />}/>        
        {/* <Input type="button" label="Concluir" color={'primary'} className={'w-40'} startContent={<ChevronRightIcon width='40' />} /> */}
      </div>
    </div>
  );
}