import { Procedures, NavigateTicket } from "../../components";

export default function Procedure({ params: { id } }: { params: { id: string } }) {

  return (
    <div className="flex flex-col flex-stretch px-4 pt-3 mt-0 h-full grow justify-around">
      <p className='bg-purple-700 text-white rounded content-center p-1'>
        Vou realizar alguns procedimentos no seu roteador. O sinal pode ficar indisponível. Um momento, por gentileza.
      </p>
      <div className=" grid grid-cols-12">
        <div className="col-span-9">
          <Procedures />

          {/* <TextInput id={id} fieldName={'complement'} label={'Informações complementares'}/> */}
        </div>
      </div>

      <div className="flex flex-row justify-center gap-2">
        <NavigateTicket route={'/agent/triage/' + id} direction={`backwards`} />
        <NavigateTicket route={'/agent/finish/' + id} direction={`forwards`} />
      </div>
    </div>
  );
}
