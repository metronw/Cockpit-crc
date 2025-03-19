"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Checkbox } from "@nextui-org/react";
import { acceptComplianceTerm } from "../actions/complianceTerm";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { signIn, signOut, useSession } from "next-auth/react";
import { Compliance_term } from "@prisma/client";
import { ArrowRightStartOnRectangleIcon, HomeIcon } from "@heroicons/react/24/solid";


export function ComplianceTerm({term}:{term:Compliance_term}) {
  const [atBottom, setAtBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const session = useSession()
  const [isTermAccepted, setIsTermAccepted] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      setAtBottom(scrollTop + clientHeight >= scrollHeight - 5); // Allow small margin
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const onAccept = () => {
    acceptComplianceTerm(term.id, term.file).then((resp)=>{
      if(resp.status == 200){
        setIsTermAccepted(true)
      }      
    })
  }

  useEffect(()=>{
    if(isTermAccepted){
      signIn("azure-ad").then(()=> setIsRedirecting(true))
    }
  }, [isTermAccepted])

  useEffect(()=>{
    if(session.data?.user.terms_accepted){
      router.push('/')
    }else{
      setIsRedirecting(false)
    }
  }, [isRedirecting])

  if(session.data?.user.terms_accepted){
    router.push('/')
  }

  return (
    <div className="grid h-screen">
      <div ref={containerRef} className="w-full h-11/12 overflow-y-auto border rounded-lg shadow-md bg-white p-4" >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
          <div ref={termsRef} className="w-full">
            <Viewer fileUrl={term.file}  />
          </div>
        </Worker>
      </div>
        <div className="flex h-16 items-center gap-2 mt-4 p-2 bg-primary">
          <Checkbox isDisabled={!atBottom} isSelected={isChecked} onValueChange={setIsChecked} color="secondary">
            Li tudo e concordo com os termos e condições
          </Checkbox>
          <Button disabled={!isChecked} onPress={onAccept}>
            Aceitar
          </Button>
        </div>
    </div>
  );

}


// const fetchPauseStatus = async (url: string) => {
//   try {
//     const res = await fetch(url);
//     const data = await res.json();
//     if (data.error === 'Interface não encontrada em nenhuma fila') {
//       return { error: 'Interface não encontrada em nenhuma fila' };
//     }
//     if (!res.ok) {
//       return { error: data.error || 'Erro desconhecido' };
//     }
//     return data;
//   } catch (error) {
//     console.error("Erro ao buscar status de pausa:", error);
//     return { error: 'Erro ao buscar status de pausa' };
//   }
// };

export function Header(){

  // const { data: pauseData, error: pauseError, mutate } = useSWR('/api/phone/pauseUser', fetchPauseStatus);
  const router = useRouter()

  // const isLoggedIn = !(pauseData?.error === 'Interface não encontrada em nenhuma fila');

  const handleSignOut = async () => {
    // if (isLoggedIn) {
    //   setLogoutModalOpen(true);
    // } else {
      signOut();
    // }
  };

  // const handleLogout = async () => {
  //   try {
  //     // Obter dados do usuário
  //     const userDataResponse = await fetch('/api/phone/user', {
  //       method: 'GET',
  //       headers: { 'Content-Type': 'application/json' },
  //     });
  //     const userData = await userDataResponse.json();

  //     // Requisição DELETE para deslogar a interface das filas
  //     const logoutResponse = await fetch('/api/phone/loginUser', {
  //       method: 'DELETE',
  //       headers: { 'Content-Type': 'application/json' },
  //       credentials: 'include',
  //       body: JSON.stringify({
  //         interfaceName: `PJSIP/${userData.sip_extension}`,
  //       }),
  //     });

  //     const data = await logoutResponse.json();

  //     if (logoutResponse.ok) {
  //       toast.success(data.message || 'Deslogado das filas com sucesso.');
  //       setTimeout(() => {
  //         mutate('/api/phone/pauseUser');
  //       }, 2000);
  //     } else {
  //       toast.error(data.error || 'Erro ao deslogar das filas.');
  //     }
  //   } catch (error) {
  //     toast.error('Erro ao executar deslogout.');
  //   }
  // };


  return (
    <div className='grid grid-cols-12'>
      <div className='flex flex-row gap-4 col-span-3 pl-4'>
        <Button isIconOnly color="primary" aria-label="home" onPress={() => router.push('/')}>
          <HomeIcon />
        </Button>
      </div>
      <div className="flex flex-row col-span-8 space-x-4 items-center ">
        
      </div>
      <Button isIconOnly color="primary" aria-label="logout" onPress={handleSignOut}>
        <ArrowRightStartOnRectangleIcon className="col-span-1 h-10 " />
      </Button>
      
    </div>
  )
}