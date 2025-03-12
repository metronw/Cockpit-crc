'use server'

import prisma from '@/app/lib/localDb'
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/authOptions';
import { Compliance_term } from '@prisma/client';
import { sendEmail } from './api';


export async function uploadTerm({url}:{url:string}){
  const session = await getServerSession(authOptions);
  if(session){
    try{
      await prisma.compliance_term.create({data:{file: url, created_by: session.user.id}})
      return ({status: 200, message: "criado com sucesso"})

    }catch(err) {
      return({status: 500, message: "deu algo de errado"})
    }
  }
  
  return({status: 500, message: "deu algo de errado"})
}

export async function acceptComplianceTerm(id:number){
  const session = await getServerSession(authOptions);
  if(session){
    try{
      await prisma.user_compliance_term.create({data:{  compliance_term_id: id,user_id: session.user.id}})
      await sendEmail({to: session.user.email, subject:'Confirmação de termo de consentimento', message: 'I am a message' })
      return ({status: 200, message: "criado com sucesso"})

    }catch(err) {
      return({status: 500, message: "deu algo de errado"})
    }
  }
  
  
  return ({status: 200, message: "criado com sucesso"})
}

export async function getActiveComplianceTerm(){
  try{
    const term = await prisma.compliance_term.findMany({
      where:{
        is_active:true
      }
    })
    return ({status: 200, message: term })

  }catch(err) {
    return({status: 500, message: []})
  }
}

export async function getAllComplianceTerm(){
  try{
    const term = await prisma.compliance_term.findMany()
    return ({status: 200, message: term })

  }catch(err) {
    return({status: 500, message: []})
  }
}

export async function updateComplianceTerm(term:Compliance_term){
  try{
    await prisma.compliance_term.update({
      where:{
        id: term.id
      },
      data:term
    })
    return ({status: 200, message: 'sucesso' })

  }catch(err) {
    return({status: 500, message: "deu algo de errado"})
  }
}

export async function deleteComplianceTerm(term:Compliance_term){
  try{
    await prisma.compliance_term.delete({
      where:{
        id: term.id
      },
    })
    return ({status: 200, message: 'sucesso' })

  }catch(err) {
    return({status: 500, message: "deu algo de errado"})
  }
}



