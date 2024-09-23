import Image from "next/image";
import {useState, useEffect} from 'react'
import {PerformanceChart, AgentHeader, Sidebar} from '../components'
import { ArrowRightStartOnRectangleIcon} from "@heroicons/react/24/solid"
import {Input} from "@nextui-org/react"

export default function CallService() {
  
  return (
    <div className="bg-white min-h-screen font-[family-name:var(--font-geist-sans)] text-primary">
      <header className="grid grid-cols-12 w-full h-12 shadow-sm shadow-primary">
        <div className="col-span-3" ></div>
        <div className="flex flex-row col-span-8 space-x-4 items-center">
          <AgentHeader />
        </div>
        <ArrowRightStartOnRectangleIcon className="col-span-1 h-10"/>
      </header>
      <main className="grid grid-cols-12">
        <div className="col-span-4 bg-primary">
          <Sidebar />
        </div>
        <div className="col-span-8 grid grid-rows-12">
          <div className="row-span-1 grid grid-cols-12 text-xl">
            <div className="col-span-3 m-2 p-3 ">
                
            </div>
            <div className="col-span-5 m-2 p-3 shadow shadow-black rounded text-center">
                ACEM PRIME
            </div>
            <div className="col-span-3 m-2 p-3 shadow shadow-black rounded text-center">
                Atendimento Telefônico
            </div>
          </div>
          <div className="row-span-1 grid grid-cols-12">
            <div className="col-span-3 m-2 p-3  rounded text-center">
                <span className="text-md">Etapa do atendimento: </span><span className="font-bold">TRIAGEM</span>
            </div>
            <div className="flex flex-col col-span-3 m-2 p-3 shadow shadow-black rounded text-center justify-center">
                <p>Interação na etapa</p>
                <p>1:48</p>
            </div>
          </div>
          <div className="row-span-1 grid grid-cols-12">
            <Input type="email" label="CPF" color={'primary'} className={'w-40'}/>
          </div>
          <div className="row-span-1 grid grid-cols-12">
            <Input type="email" label="Telefone com DDD" color={'primary'} className={'w-40'}/>
          </div>
          <div className="row-span-1 grid grid-cols-12">
            <Input type="email" label="Status do Contrato" color={'primary'} className={'w-40'}/>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}