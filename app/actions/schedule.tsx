'use server'

import prisma from '@/app/lib/localDb';
import { Schedule } from '@prisma/client';

export async function getSchedule(){

    const schedules = prisma.schedule.findMany()
    return schedules
}

export async function updateSchedule(schedule: Schedule){

  const resp = prisma.schedule.update({
    where:{ id: schedule.id},
    data:{...schedule},
  })
  return resp
}

export async function createSchedule(){
  try{
    const resp = prisma.schedule.create({
      data:{}
    })
    return resp
  }catch(err){
    console.log(err)
  }
}

export async function deleteSchedule(id: number){

  const resp = prisma.schedule.delete({
    where:{id}
  })
  return resp  
}

export async function updateUserGoal(user_id: number, goal: number){

  const resp = prisma.user.update({
    where:{ id: user_id},
    data:{goal},
  })
  return resp
}

export async function updateUserSchedule(user_id: number, schedule_id: number){

  const resp = prisma.user.update({
    where:{ id: user_id},
    data:{schedule_id},
  })
  return resp
}

export async function getUser ( id: number){
  const resp = prisma.user.findFirst({
    where:{ id},
    include: {schedule: true, session_history: true}
  })
  return resp
}