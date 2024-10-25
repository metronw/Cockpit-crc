
import { ServiceNavBar } from "./components";
import { Card, CardBody } from "@nextui-org/react";

export default function ServiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex flex-col grow h-full'>
      {/* <ServiceNavBar/> */}
      <div className='col-span-8 bg-white flex flex-row p-2 space-x-4 justify-center'>
        <Card className="border border-primary">
          <CardBody><p className="text-primary">ACEM PRIME</p></CardBody>
        </Card>
        <Card className="border border-primary">
          <CardBody><p className="text-primary">Atendimento Telefônico</p></CardBody>
        </Card>
        <Card className="border border-primary">
          <CardBody>
            <p className="text-center text-primary">Etapa do atendimento:</p> 
            <p className="font-bold text-primary text-center">TRIAGEM</p>
            </CardBody>
        </Card>
        <Card className="border border-primary">
          <CardBody>
            <p className="text-primary text-center">Interação na etapa</p>
            <p className="text-primary text-center">1:48</p>
          </CardBody>
        </Card>
      </div>
      <div className='flex flex-col grow h-full'>
        {children}
      </div>
    </div>
  );
}