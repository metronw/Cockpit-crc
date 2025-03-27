'use server'

import prisma from '@/app/lib/localDb';

export async function upsertTeam({id, leader_id}:{id?:number | undefined, leader_id?: number | undefined}){
    const team = prisma.team.upsert({
      where:{ id: id ?? 0},
      update: {leader_id},
      create: {leader_id},
    })
    return team
}


export async function getAllTeams(){
  const teams = prisma.team.findMany({
    include:{User: true}
  })
  return teams
}

export async function assignUserToTeam(user_id: number, team_id: number | null) {
  try{
    await prisma.user.update({
      where: {id: user_id},
      data: {team_id}
    })
  }catch(err){
    console.log(err)
  }
}