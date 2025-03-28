'use server'

import prisma from '@/app/lib/localDb'
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/authOptions';
import { JsonValue } from '@prisma/client/runtime/library';
import { Procedure_item } from '@prisma/client';

export interface IProcedure {
  id: number,
  company_id: number | null,
  ticket_type_id: number | null,
  items: IProcedureItem[]
}

export interface IProcedureItem {
  id: number,
  company_id: number | null,
  ticket_type_id: number | null,
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

  if(session){
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

export async function getProcedureItems({company_id, ticket_type_id}:{company_id:number | null, ticket_type_id:number | null}){
  
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
        {
          company_id: null,
          ticket_type_id:null
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

export async function createProcedure({company_id, ticket_type_id, items='[]'}:{company_id:number | null, ticket_type_id:number | null, items: JsonValue}){
  return await prisma.procedures.create({
    // @ts-expect-error: json is a string
    data: { company_id, ticket_type_id, items}
  })
}

export async function getProcedure({company_id=null, ticket_type_id=null, father_ticket_type_id=null}:{company_id:number | null, ticket_type_id:number | null, father_ticket_type_id?:number | null}): Promise<IProcedure>{
  const childItems = await getProcedureItems({company_id, ticket_type_id})
  const fatherItems = await getProcedureItems({company_id, ticket_type_id:father_ticket_type_id})

  //elimina duplicatas
  const items = Object.values([...fatherItems, ...childItems].reduce((acc, el) => ({...acc, [el.id]: acc[el.id] ?? el }),{} as {[key:number]:Procedure_item}))

  let proc
  
  if(company_id && ticket_type_id ){
    proc = await prisma.procedures.findFirst({
      where: {
        company_id,
        ticket_type_id: ticket_type_id
      },
    }) 
  } 
  
  if(!proc && ticket_type_id){
    proc = await prisma.procedures.findFirst({
      where: {
        company_id: 0,
        ticket_type_id: ticket_type_id
      },
    })
  }
  
  if(!proc){
    proc = await prisma.procedures.findFirst({
      where:{
        company_id: 0, ticket_type_id: 0, items:`[]`
      }
    })
  }
  if(!proc){
    proc = await prisma.procedures.create({
      data:{
        company_id: 0, ticket_type_id: 0, items:`[]`
      }
    })
  }

  //separa os itens em alocados e não alocados e seta os alocados como checked
  const procItems = JSON.parse(proc?.items+'')
  const alloc = procItems.map((el:number) => items.find(it => it.id == el)).filter((el:number) => !!el).map((el:IProcedureItem)=>({...el, checked: true}))
  const unalloc = items.filter(el => !procItems.includes(el.id)).map((el:IProcedureItem) => ({...el, checked: false}))  
  
  return {...proc, items: [...alloc, ...unalloc]}
}

export async function saveProcedure({ company_id, ticket_type_id, items}:{ company_id:number, ticket_type_id: number,  items: IProcedureItem[]}){ 

  const data = {company_id, ticket_type_id, items: JSON.stringify(items.filter(el => el.checked).map(el => el.id))}

  return await prisma.procedures.upsert({
    where:{
      company_id_ticket_type_id: {
        ticket_type_id: ticket_type_id ? ticket_type_id : 0,
        company_id: company_id ? company_id : 0
      }
    },
    update: data,
    create: data
  }) 

}


export async function deleteProcedure( {ticket_type_id, company_id}:{ticket_type_id:number, company_id:number}){ 

  return await prisma.procedures.delete({
    where:{
      company_id_ticket_type_id:{
        ticket_type_id,
        company_id
      }
    },
  })
}

