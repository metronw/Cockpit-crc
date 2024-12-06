'use server'

import prisma from '@/app/lib/localDb'
import {z} from 'zod'
import { getCompaniesList } from './api'

export interface IUserAssign {
  id: number,
  company_id:number,
  user:IUser
  companyName:string
}

export interface IUser {
  id:number,
  name:string,
}

interface company {
  id:number,
  fantasy_name:string
}


export async function assignUser(company_id: number | null, user_id: number | null, queue_type: number | null){
  
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

export async function getUserAssignments(){
  const companies = JSON.parse(await getCompaniesList()) 
  const assigns =  await prisma.user_assign.findMany({include: {user: true }})

  return assigns.map(el => {
    const comp = companies.find((item:company) => el.company_id == item.id)
    return {...el, companyName:comp.fantasy_name}
  })
}


