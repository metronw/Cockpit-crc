import {ChevronRightIcon, ChevronLeftIcon} from "@heroicons/react/24/solid"
import { TextInput, Procedures } from "../../components";
import Link from "next/link";


export default function Procedure({params: {id}}: {params: {id: string}}) {
  
  return (
    <div className="flex flex-col pt-3 mx-4 h-full">        
      <p className='bg-purple-700 text-white rounded content-center px-2 my-1 py-1'>
        Vou realizar alguns procedimentos no seu roteador. O sinal pode ficar indisponível. Um momento, por gentileza.
      </p>      
        <div className=" grid grid-cols-12 h-full">
          <div className="col-span-6 h-full">
            <Procedures />
            <TextInput id={id} fieldName={'erp'} label={'Protocolo ERP'} isRequired={true}/>
            <TextInput id={id} fieldName={'complement'} label={'Informações complementares'}/>
          </div>
        </div>

      <div className="flex flex-row justify-center ">
        <Link href={'/agent/triage/'+id} className="w-40"><ChevronLeftIcon width='40' /> Anterior  </Link>
        <Link href={'/agent/finish/'+id} className="w-40">  Próximo <ChevronRightIcon width='40' /></Link>
      </div>
    </div>
  );
}
