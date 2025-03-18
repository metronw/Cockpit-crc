'use server'

import prisma from '@/app/lib/localDb';

export async function upsertTeam({id, leader_id}:{id:number | undefined, leader_id: number}){
    const team = prisma.team.upsert({
      where:{ id},
      update: {leader_id},
      create: {leader_id},
    })
    return team
}

export async function getAllTeams(){
  
}