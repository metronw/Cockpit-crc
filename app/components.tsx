'use client'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, } from "@nextui-org/react"
import {ClockIcon, PlayPauseIcon, ArrowRightStartOnRectangleIcon} from "@heroicons/react/24/solid"



export const PerformanceChart = () => {
  const data = [{name: 'Dia 1', uv: 400, pv: 2400, amt: 2400}, {name: 'Dia 2', uv: 200, pv: 3000, amt: 2400}, {name: 'Dia 3', uv: 700, pv: 3000, amt: 2400}];
  return(
    <BarChart width={600} height={300} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
      <Bar  dataKey="uv" stroke="#8884d8" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
    </BarChart>
  )
}

export const AgentHeader = () => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  return (
    <>
      <span className="font-bold">Agente - 3650 </span>
      <ClockIcon className="h-10" />
      <div>13:16</div>      
      <Button onPress={onOpen}><PlayPauseIcon className="h-10 text-primary"/></Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-black">Pausar</ModalHeader>
              <ModalBody>
                <div className='flex flex-col gap-1 text-black text-lg'>
                  <Button color="primary" className='text-lg'>10 Minutos</Button>
                  <Button color="primary" className='text-lg'>15 Minutos</Button>
                  <Button color="primary" className='text-lg'>Treinamento</Button>
                  <Button color="primary" className='text-lg'>Feedback</Button>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fechar
                </Button>
                <Button color="primary" onPress={onClose}>
                  Pausar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export const Sidebar = () => {
  return(
    <div className="col-span-4 h-screen text-black bg-primary space-y-2 px-2 py-2">
      <Company />
      <div className="flex flex-row align-center h- space-x-2">
        <div className="flex  w-2/12 justify-center  py-1 "></div>
        <div className="flex border border-black rounded w-8/12 justify-center bg-amber-200 py-1  text-sm">José Alves</div>
        <div className="flex border border-black bg-amber-200 w-1/12 rounded justify-center align-center text-sm">1:57</div>
      </div>
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

