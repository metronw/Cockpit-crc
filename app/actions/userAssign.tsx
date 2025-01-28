'use server'

import prisma from '@/app/lib/localDb'
import {z} from 'zod'
import { getAllCompanies } from './company';
import { Company } from '@prisma/client'

export interface IUserAssign {
  id: number;
  company_id:number;
  user_id: number;
  user:IUser;
  companyName:string;
  queue_type:number;
}

export interface IUser {
  id:number;
  name:string;
  metro_id?: number
  email: string
}



export async function assignUser({company_id= null, user_id=null, queue_type= null}: {company_id: number | null, user_id: number | null, queue_type: number | null}){
  
  if(company_id && user_id && queue_type){
      const schema = z.object({company_id: z.number(), user_id:z.number(), queue_type:z.number()})
      const params = {company_id:company_id, user_id:user_id, queue_type:queue_type}
      schema.parse(params)

      const resp = await prisma.user_assign.create({data: params})

      return resp
    }   
    
  }
  
export async function deleteUserAssign(ids: Array<number>){
  return await prisma.user_assign.deleteMany({where:{id:{in: ids}}}) 
}

export async function batchAssignUser({companies, user_id=0, queue_type=null}: {companies: number[], user_id: number | null, queue_type: number | null}){
  companies.forEach(el => {
    assignUser({company_id: el, user_id, queue_type})
  })
}

export async function getUserAssignments() : Promise<Array<IUserAssign>> {
  const companies = await getAllCompanies()
  const assigns =  await prisma.user_assign.findMany({include: {user: true }})

  return assigns.map((el) => {
    const comp = companies.find((item:Company) => el.company_id == item.id)
    return {
      ...el, 
      companyName: comp?.fantasy_name ?? ``,
      queue_type: el.queue_type ?? 1 // Garantir que queue_type não seja null
    }
  })
}


