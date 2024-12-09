'use server'

import prisma from '@/app/lib/localDb'
import {z} from 'zod'


export async function upsertCompany({id, fantasy_name}:{id:number | null, fantasy_name:string | null}){
  
  const schema = z.object({fantasy_name:z.string(), id:z.number()})
  if(fantasy_name && id){
    const params = {fantasy_name, id}
    schema.parse(params)
    const resp = await prisma.company.upsert({where:{id},update:params, create:params})
    return resp
  }   

}

// export async function getUserAssignments(){
//   return await prisma.user_assign.findMany()
// }