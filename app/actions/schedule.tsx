'use server'

import prisma from '@/app/lib/localDb';
import { User_schedule } from '@prisma/client';

export async function getUserSchedule(id:number){

    const schedules = prisma.user_schedule.findMany({
      where:{user_id: id,}
    })
    return schedules
}

export async function updateUserSchedule(schedule: User_schedule){

  const resp = prisma.user_schedule.upsert({
    where:{ id: schedule.id},
    update:{...schedule},
    create:{...schedule}
  })
  return resp
}

export async function createUserSchedule(user_id:number){

  const resp = prisma.user_schedule.create({
    data:{user_id, is_active:false}
  })
  return resp
}

export async function deleteUserSchedule(id: number){

  const resp = prisma.user_schedule.delete({
    where:{id}
  })
  return resp  
}