'use server'

import prisma from '@/app/lib/localDb'
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/authOptions';
import { JsonValue } from '@prisma/client/runtime/library';

export interface IProcedure {
  id: number,
  company_id: number | null,
  ticket_type_id: number,
  items: IProcedureItem[]
}

export interface IProcedureItem {
  id: number,
  company_id: number | null,
  ticket_type_id: number,
  label: string,
  input_type: number,
  modal_body: JsonValue,
  modal_title: string | null
  checked?: boolean
}

export async function createProcedureItem({
  company_id, ticket_type_id, label, input_type, modal_body, modal_title, id }:{
    company_id:number | null, 
    ticket_type_id:number | null, 
    label: string , 
    input_type: number , 
    modal_body:string | undefined, 
    modal_title: string | null  
    id: number | undefined
  }){
    
  const session = await getServerSession(authOptions);

  if(session && ticket_type_id){
    try{
      await prisma.procedure_item.upsert({
        where:{
          id: id ?? 0
        },
        update:{
          company_id, ticket_type_id, label, input_type, created_by:session.user.id, modal_body, modal_title 
        },
        create: { company_id, ticket_type_id, label, input_type, created_by:session.user.id, modal_body, modal_title },
      })
      return {message: 'procedimento criado com sucesso', status: 'success'}
  
    }catch(error){
      return {message: JSON.stringify(error), status: 'error'}
    }
  }
  return {message: 'erro', status: 'error'}

} 

export async function getProcedureItems({company_id, ticket_type_id}:{company_id:number | null, ticket_type_id:number}){
  
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

export async function getAllProcedureItems() : Promise<Array<IProcedureItem>> {
  const procedureItems = await prisma.procedure_item.findMany();
  return procedureItems
}

export async function deleteProcedureItem(ids: Array<number>){
  return await prisma.procedure_item.deleteMany({where:{id:{in: ids}}}) 
}

export async function createProcedure({company_id, ticket_type_id, items='[]'}:{company_id:number | null, ticket_type_id:number, items: JsonValue}){
  return await prisma.procedures.create({
    // @ts-expect-error: json is a string
    data: { company_id, ticket_type_id, items}
  })
}

export async function getProcedure({company_id=null, ticket_type_id}:{company_id:number | null, ticket_type_id:number}){
  const items = await getProcedureItems({company_id, ticket_type_id})
  
  let proc = await prisma.procedures.findFirst({
    where: {
      OR: [
        {
          company_id,
          ticket_type_id
        },

      ]
    },
  })

  if(!proc){
    proc = await createProcedure({company_id, ticket_type_id, items: JSON.stringify(items.map(el => el.id))})
  }

  const procItems = JSON.parse(proc?.items+'')
  const alloc = procItems.map((el:number) => items.find(it => it.id == el)).filter((el:number) => !!el).map((el:IProcedureItem)=>({...el, checked: true}))
  const unalloc = items.filter(el => !procItems.includes(el.id)).map((el:IProcedureItem) => ({...el, checked: false}))
  
  
  return {...proc, items: [...alloc, ...unalloc]}
}

export async function saveProcedure(procedure:IProcedure){

  return await prisma.procedures.update({
    where:{
      id: procedure.id
    },
    data: { company_id: procedure.company_id, ticket_type_id: procedure.ticket_type_id, items: JSON.stringify(procedure.items.filter(el => el.checked).map(el => el.id))}
  })
}

