import Image from "next/image";
import {useState, useEffect} from 'react'
import {PerformanceChart} from './components'
import {ClockIcon, PlayPauseIcon, ArrowRightStartOnRectangleIcon} from "@heroicons/react/24/solid"


export default function Home() {
  
  return (
    <div className="bg-white min-h-screen font-[family-name:var(--font-geist-sans)] text-primary">
      <header className="grid grid-cols-12 w-full h-12 shadow-sm shadow-primary">
        <div className="col-span-3" ></div>
        <div className="flex flex-row col-span-8 space-x-4 items-center">
          <span className="font-bold">Agente - 3650 </span>
          <ClockIcon className="h-10" />
          <div>13:16</div>
          <PlayPauseIcon className="h-10"/>
        </div>
        <ArrowRightStartOnRectangleIcon className="col-span-1 h-10"/>
      </header>
      <main className="grid grid-cols-12">
        <Sidebar />
        <div className="col-span-8 grid grid-rows-12 w-full">
          <div className="row-span-3">
            <DailyPanel />
          </div>
          <div className="row-span-3">
            <PerformanceChart/>
          </div>
          <div className="row-span-2">
            <MonthlyPanel />
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        
      </footer>
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

const Sidebar = () => {
  return(
    <div className="col-span-4 h-screen text-black bg-primary space-y-2 px-2 py-2">
      <Company />
      <Company />          
    </div>
  )
}

const Company = () => {
  return(
    <div className="flex flex-row align-center h- space-x-2 ">
      <div className="flex border border-black bg-red-500 h-6 w-1/12 rounded justify-center align-center">!!</div>
      <div className="flex border border-black rounded bg-white w-8/12 justify-center bg-white px-2 py-1 ">ACEM PRIME</div>
      <div className="flex border border-black bg-red-500 h-6 w-1/12 rounded justify-center align-center">5</div>
      <div className="flex border border-black bg-green-500 h-6 w-1/12 rounded justify-center align-center">+</div>
    </div>
  )
}