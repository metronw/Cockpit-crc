import {Input, Tooltip, Divider} from "@nextui-org/react"
import {ChevronRightIcon, ChevronLeftIcon} from "@heroicons/react/24/solid"
import { RadioInput } from "../components";

export default function Procedure() {
  
  return (
    <div className="flex flex-col pt-3 mx-4 h-full">        
      <p className='bg-purple-700 text-white rounded content-center px-2 my-1 py-1'>
        Vou realizar alguns procedimentos no seu roteador. O sinal pode ficar indisponível. Um momento, por gentileza.
      </p>
        <div className=" grid grid-cols-12 h-full">
          <div className="col-span-6 h-full">
            <RadioInput procedure={'Exemplo de procedimento'} />
            <RadioInput isInteractive={true} procedure={'O modem foi reiniciado?'}/>
            <Input type="text" label="Protocolo ERP" variant={'bordered'} color={'primary'} className={'w-40 h-11 border border-primary rounded-medium my-2'}/>
            <Input type="text" label="Informações complementares" variant={'bordered'} color={'primary'} className={'w-80 h-11 border border-primary rounded-medium my-2'}/>
          </div>
        </div>

      <div className="flex flex-row justify-center ">
        <Input type="button" label="Voltar" color={'primary'} className={'w-40'} startContent={<ChevronLeftIcon width='40' />}/>        
        <Input type="button" label="Próximo" color={'primary'} className={'w-40'} startContent={<ChevronRightIcon width='40' />} />
      </div>
    </div>
  );
}