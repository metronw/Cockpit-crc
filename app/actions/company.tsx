'use server'

import prisma from '@/app/lib/localDb'
import {z} from 'zod'
import { Company, Company_group } from '@prisma/client'

export interface ICompanyGroup {
  id:number;
  name:string;
  company_list: Company[];
}

export async function getCompany({id}:{id:number}){
  const resp = await prisma.company.findFirst({where:{id}})
  return resp
} 

export async function getAllCompanies(){
  return await prisma.company.findMany() as Company[]
}

function mapCompaniesToGroups(ids: number[], companies: Company[]): Company[]{
  return ids.map(id => companies.find((el:Company):boolean => el.id === id)).filter((el): el is Company => !!el);
}


export async function getAllCompanyGroups(){
  const companies = await prisma.company.findMany();
  const cgs = await prisma.company_group.findMany() as Company_group[]
  return cgs.map((el:Company_group):ICompanyGroup => ({...el, company_list: mapCompaniesToGroups(JSON.parse(el.company_list), companies) })) 
}


export async function upsertCompany({id, fantasy_name, threshold_1, threshold_2}:{id:number | null, fantasy_name:string | null,  threshold_1: number | null, threshold_2: number | null}){
  
  const schema = z.object({fantasy_name:z.string(), id:z.number()})
  if(fantasy_name && id){
    const params = {fantasy_name, id, threshold_1, threshold_2}
    schema.parse(params)
    const resp = await prisma.company.upsert({where:{id},update:params, create:params})
    if(resp) return {status:200, message: 'saved successfully'}
    return {status: 500, message: 'there was a problem'}
  }
  return {status: 400, message: 'there was a problem'}
}

export async function upsertCompanyGroup({name='', company_list=[], id=0}:{name:string, company_list:Company[],id: number}){ 
  const list = {name, company_list: JSON.stringify(company_list.map(el=> el.id))}
  try{
    const resp = await prisma.company_group.upsert({where:{id},update:list, create:list})
    return resp
  }catch(err){
    return undefined
  }
}