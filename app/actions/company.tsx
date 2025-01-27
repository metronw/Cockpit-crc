'use server'

import prisma from '@/app/lib/localDb'
import {z} from 'zod'
import { Company } from '@prisma/client'

export async function getCompany({id}:{id:number}){
  const resp = await prisma.company.findFirst({where:{id}})
  return resp
} 

export async function getAllCompanies(){
  return await prisma.company.findMany() as Company[]
}


export async function upsertCompany({id, fantasy_name}:{id:number | null, fantasy_name:string | null}){
  
  const schema = z.object({fantasy_name:z.string(), id:z.number()})
  if(fantasy_name && id){
    const params = {fantasy_name, id}
    schema.parse(params)
    const resp = await prisma.company.upsert({where:{id},update:params, create:params})
    return resp
  }
  
}

export async function upsertCompanyGroup({name='', companies=[], id=0}:{name:string, companies:number[],id: number}){
  const list = {name, company_list: JSON.stringify(companies)}
  try{
    const resp = await prisma.company_group.upsert({where:{id},update:{name, company_list: JSON.stringify(companies)}, create:list})
    return resp
  }catch(err){
    return undefined
  }
}

// export async function getUserAssignments(){
//   return await prisma.user_assign.findMany()
// }