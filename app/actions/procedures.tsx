'use server'

import prisma from '@/app/lib/localDb'
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/authOptions';
import { JsonValue } from '@prisma/client/runtime/library';

export interface IProcedure {
  id: number,
  company_id: number | null,
  ticket_type_id: number,
  label: string,
  input_type: number,
  modal_body: JsonValue,
  modal_title: string | null
}

export async function createProcedure({
  company_id, ticket_type_id, label, input_type, modal_body, modal_title }:{
    company_id:number | null, 
    ticket_type_id:number | null, 
    label: string , 
    input_type: number , 
    modal_body:string | undefined, 
    modal_title: string | null  
  }){
  const session = await getServerSession(authOptions);

  if(session && ticket_type_id){
    
    try{
      await prisma.procedure_item.create({
        data: { company_id, ticket_type_id, label, input_type, created_by:session.user.id, modal_body, modal_title },
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
  return procedureItems
}

export async function getAllProcedures() : Promise<Array<IProcedure>> {
  const procedureItems = await prisma.procedure_item.findMany();
  return procedureItems
}

export async function deleteProcedure(ids: Array<number>){
  return await prisma.procedure_item.deleteMany({where:{id:{in: ids}}}) 
}