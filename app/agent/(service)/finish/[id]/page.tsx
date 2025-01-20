import { FinishButton, TicketSummary, NavigateTicket } from "../../components";
import { use } from "react";
import { getTicket} from '@/app/actions/ticket';

export default function Finishing({params: {id}}: {params: {id: string}}) {
  const ticket = use(getTicket(parseInt(id)))

  return (
    <div className="flex flex-col pt-3 h-full">    
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-6 flex flex-col mx-4 gap-4">
          <p className='bg-purple-700 text-white rounded content-center px-2 my-1 py-1'>
            <strong>{ticket?.caller_name}</strong>, foi aberto o protocolo <strong>{ticket?.erpProtocol}</strong> para o setor responsável.
          </p>
          {/* <div className="border rounded border-warning p-2 my-2">
            <p className="text-warning">Prazo Financeiro/Comercial: Até proximo dia útil</p>
            <p className="text-warning">Prazo técnico: Dois dias úteis para retorno telefônico</p>
          </div> */}
          <p className='bg-purple-700 text-white rounded content-center px-2 my-1 py-1'>
            {"Poderia te auxiliar em algo mais?"}
          </p>
          <p className='bg-purple-700 text-white rounded content-center px-2 my-1 py-1'>
            {"Agradecemos o seu contato! Tenha uma ótima tarde e boa semana!"}
          </p>

        </div>
        <div className="col-span-5 h-full">
          <TicketSummary  />
        </div>
        
      </div>    
      <div className="flex flex-row justify-center gap-2">
        <NavigateTicket route={'/agent/procedure/'+id} direction={`backwards`} />
        <FinishButton />
      </div>
    </div>
  );
}