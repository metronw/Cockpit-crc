import { FinishButton, TicketSummary, NavigateTicket, TextInput, CloneTicketButton } from "../../components";
import { use } from "react";
import { getTicket } from '@/app/actions/ticket';
import { Snippet } from "@nextui-org/react";

export default function Finishing({ params: { id } }: { params: { id: string } }) {
  const ticket = use(getTicket(parseInt(id)));

  async function nextPage() {
    'use server'
    return
  }

  return (
    <form action={nextPage} className="flex flex-col pt-3 h-full">
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-6 flex flex-col mx-4 gap-4">
          {
            ['triage', 'procedure','finish'].includes(ticket?.status ?? '') ? 
              <div>
                {
                  (ticket?.communication_type == `phone` ?
                  null :
                  <TextInput id={id} fieldName={'communication_id'} label={'Protocolo de chat'} isRequired={true} />)
                }
              <TextInput id={id} fieldName={'erpProtocol'} label={'Protocolo ERP'} isRequired={true} />

              </div>
              : null
          }
          <Snippet hideSymbol classNames={{base: "bg-purple-700 text-white rounded content-center px-2 my-1 py-1 " }}>
            <p className='bg-purple-700 text-white rounded content-center text-wrap'>
              <strong>{ticket?.caller_name}</strong>, foi aberto o protocolo <strong>{ticket?.erpProtocol}</strong> para o setor responsável.
            </p>
          </Snippet>
          {/* <div className="border rounded border-warning p-2 my-2">
            <p className="text-warning">Prazo Financeiro/Comercial: Até proximo dia útil</p>
            <p className="text-warning">Prazo técnico: Dois dias úteis para retorno telefônico</p>
          </div> */}
          <Snippet hideSymbol className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1">
            <p className='bg-purple-700 text-white rounded content-center text-wrap '>
              {"Poderia te auxiliar em algo mais?"}
            </p>
          </Snippet>
          <Snippet hideSymbol classNames={{base: "bg-purple-700 text-white rounded content-center px-2 my-1 py-1 " }}>
            <p className=' bg-purple-700 text-white rounded content-center text-wrap'>
              {"Agradecemos o seu contato! Tenha uma ótima tarde e boa semana!"}
            </p>
          </Snippet>
        </div>
        <div className="col-span-5 h-full w-70">
          <div id="ticket-summary" className="flex flex-col gap-2">
            {ticket && <TicketSummary />}
            <CloneTicketButton/>
          </div>
        </div>
      </div>
      {
        ['triage', 'procedure','finish'].includes(ticket?.status ?? '') ?
          <div className="flex flex-row justify-center gap-2 mt-1">
            <NavigateTicket route={'/agent/procedure/' + id} direction={`backwards`} />
            <FinishButton />
          </div>
          :
          null
      }
    </form>
  );
}