'use server'

import prisma from '@/app/lib/localDb';
import bcrypt from 'bcrypt'; // Assuming passwords are hashed in the database
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/authOptions';

interface LoginCredentials {
  email: string;
  password: string;
}

export async function loginUser({ email, password }: LoginCredentials) {
  // Retrieve the user from the database by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    // Return error if user not found or password doesn't match
    throw new Error('Invalid email or password');
  }
  
  const session = await getServerSession(authOptions);

  redirect('/agent/'+session?.user.id)

}

export async function loginSSO({email, name, metro_id=312} :{email:string, name?:string, metro_id: number}){
  
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if(user){
    await prisma.user.update({
      where:{email},
      data:{metro_id: metro_id}
    })
  }

  if(!user){
    const password = bcrypt.hashSync('951Mudar!', 10)
    user = await prisma.user.create({
      data: {
        email,
        name: name ?? '',
        password: password, 
        metro_id: metro_id
      },
    });
  }
  
  return user
}

export async function logout(){
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user.id;

    if (!sessionUser) {
      throw new Error('Usuário não está logado');
    }

    // Obter interfaceName a partir da tabela user_phone
    const userPhone = await prisma.user_phone.findUnique({
      where: { user_id: sessionUser },
    });

    if (!userPhone) {
      throw new Error('Configurações de telefone não encontradas para o usuário');
    }

    const interfaceName = 'PJSIP/' + userPhone.sip_extension;

    // Fazer a requisição DELETE para remover o agente das filas
    const response = await fetch('/api/phone/loginUser/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interfaceName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Falha ao remover o agente das filas');
    }

    // Redirecionar para a página de login
    redirect('/login');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro durante logout:', error.message);
    } else {
      console.error('Erro desconhecido durante logout');
    }
    // Redirecionar mesmo em caso de erro
    redirect('/login');
  }
}
