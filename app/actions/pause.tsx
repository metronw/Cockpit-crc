'use server'

import prisma from '@/app/lib/localDb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/authOptions';

export async function pauseSession ({pause_type }:{pause_type: string}){

  const session = await getServerSession(authOptions);

  const user_id = session?.user.id
  if(user_id){
    const pause = await prisma.user_pause.findFirst({ where: {finished_at: null, user_id}})
    if(pause){
      await prisma.user_pause.update({
        where: {id: pause.id},
        data: {finished_at: new Date()}
      })
      return({status: 200, message: 'Despausado com sucesso'})   
    }else{
      await prisma.user_pause.create({
        data: {pause_type: pause_type, user_id}
      })
      return({status: 200, message: 'Pausado com sucesso'})
    }

    
  }
  return({status: 500, message: 'Deu algo de errado'})
}
