'use server'

import prisma from '@/app/lib/localDb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/authOptions';
import { Prisma } from '@prisma/client';

export async function getActiveSessions(){

  const session = await getServerSession(authOptions);

  const user_id = session?.user.id
  if(user_id){
    const sessions = prisma.session_history.findMany({
      where:{user_id, logged_out_at: null},
      include: {User:true}
    })
    return sessions
  }
  return []
}

export type UserWithSession = Prisma.UserGetPayload<{
  include: { session_history: true, user_schedule: true };
}>;


export async function getAllUsers(){

  const users = await prisma.user.findMany({
    include: {session_history:{
      where: {
        logged_out_at: null, // Only include sessions that are still open
      },
    },
    user_schedule:true
  }
  })
  return users
}

