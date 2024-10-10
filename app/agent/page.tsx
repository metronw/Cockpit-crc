import Image from "next/image";
import {PerformanceChart, AgentHeader, Sidebar} from './components'
import { ArrowRightStartOnRectangleIcon} from "@heroicons/react/24/solid"


export default function Home() {
  
  return (      
    <div className="flex flex-col space-y-4">
      <div className="">
        <DailyPanel />
      </div>
      <div className="">
        <PerformanceChart/>
      </div>
      <div className="">
        <MonthlyPanel />
      </div>
    </div>
  );
}

const MonthlyPanel = () => {
  return (
    <div className="grid grid-cols-12 w-full gap-2 px-2">
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Produção do Mês</span>
          <span className="font-bold">2</span>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>TMA</span>
          <span className="font-bold">1:10:33</span>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Média de Inatividade</span>
          <span className="font-bold">50:07</span>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Não confirmidades</span>
          <span className="font-bold">4</span>
        </div>
      </div>
    </div>
  )
}


const DailyPanel = () => {
  return (
    <div className="grid grid-cols-12 w-full gap-2 px-2">
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Total empresas</span>
          <span className="font-bold">2</span>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Produção Dia</span>
          <div className="grid grid-cols-4">
            <span className="text-sm col-span-2">Corrente</span>
            <span className="text-sm col-span-2">Final</span>
          </div>
          <div className="grid grid-cols-4">
            <span className="col-span-2 font-bold">5</span>
            <span className="col-span-2 font-bold">8</span>
          </div>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>TMA Dia</span>
          <span className="font-bold">1:23:33</span>
        </div>
      </div>
      <div className="col-span-3 h-40">
        <div className="flex flex-col shadow-sm shadow-black h-full rounded w-full justify-center text-center bg-white px-2 py-1 mt-2 ml-2 h-18">
          <span>Meta do Dia</span>
          <div className="grid grid-cols-4">
            <span className="font-bold col-span-2">40</span>
            <span className="font-bold col-span-2">0%</span>

          </div>
        </div>
      </div>

    </div>
  )
}


