import {  Procedures, NavigateTicket } from "../../components";


export default function Procedure({params: {id}}: {params: {id: string}}) {
  
  return (
    <div className="flex flex-col pt-3 mx-4">
      <p className='bg-purple-700 text-white rounded content-center px-2 my-1 py-1'>
        Vou realizar alguns procedimentos no seu roteador. O sinal pode ficar indisponível. Um momento, por gentileza.
      </p>      
        <div className=" grid grid-cols-12">
          <div className="col-span-6">
            <Procedures />
            {/* <TextInput id={id} fieldName={'erp'} label={'Protocolo ERP'} isRequired={true}/>
            <TextInput id={id} fieldName={'complement'} label={'Informações complementares'}/> */}
          </div>
        </div>

      <div className="flex flex-row justify-center gap-2">
        <NavigateTicket route={'/agent/triage/'+id} direction={`backwards`} />
        <NavigateTicket route={'/agent/finish/'+id} direction={`forwards`} />
      </div>
    </div>
  );
}
