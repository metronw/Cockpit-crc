"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Checkbox } from "@nextui-org/react";
import { acceptComplianceTerm } from "../actions/complianceTerm";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { signIn, useSession } from "next-auth/react";
import { Compliance_term } from "@prisma/client";


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