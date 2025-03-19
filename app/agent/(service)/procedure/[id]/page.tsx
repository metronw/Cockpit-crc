import { Snippet } from "@nextui-org/react";
import { Procedures, NavigateTicket } from "../../components";

export default function Procedure({ params: { id } }: { params: { id: string } }) {

  return (
    <div className="flex flex-col flex-stretch px-4 pt-3 mt-0 h-full grow justify-around">
      <Snippet hideSymbol className="bg-purple-700 text-white rounded content-center px-2 my-1 py-1">
        <p className='bg-purple-700 text-white rounded content-center p-1'>
          Vou realizar alguns procedimentos no seu roteador. O sinal pode ficar indisponível. Um momento, por gentileza.
        </p>
      </Snippet>
      <div className=" grid grid-cols-12">
        <div className="col-span-9">
          <Procedures />

        </div>
      </div>

      <div className="flex flex-row justify-center gap-2">
        <NavigateTicket route={'/agent/triage/' + id} direction={`backwards`} />
        <NavigateTicket route={'/agent/finish/' + id} direction={`forwards`} />
      </div>
    </div>
  );
}
