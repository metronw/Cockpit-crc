'use server'

import { cookies } from 'next/headers'
import prisma from '@/app/lib/localDb'



export async function createProcedure({
  company_id, ticket_type_id, label, input_type, modal_body, modal_title }:{
    company_id:number | null, 
    ticket_type_id:number | null, 
    label: string , 
    input_type: number , 
    modal_body:string | null, 
    modal_title: string | null  
  }){
  const cookieStore = cookies()
  const token = cookieStore.get('logged_user')
  if(token && ticket_type_id){
    const user = JSON.parse(token.value)
    try{
      await prisma.procedure_item.create({
        data: { company_id, ticket_type_id, label, input_type, created_by:user.id, modal_body, modal_title },
      })
      return {message: 'procedimento criado com sucesso', status: 'success'}
  
    }catch(error){
      return {message: JSON.stringify(error), status: 'error'}
    }
  }
  return {message: 'erro', status: 'error'}

} 

export async function getProcedures({company_id, ticket_type_id}:{company_id:number, ticket_type_id:number}){
  
  const procedureItems = await prisma.procedure_item.findMany({
    where: {
      OR: [
        {
          company_id,
          ticket_type_id
        },
        {
          company_id: null,
          ticket_type_id
        },

      ]
    },
  });
  return JSON.stringify(procedureItems)
}