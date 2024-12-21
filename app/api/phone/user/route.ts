import { NextResponse } from 'next/server';
import prisma from '@/app/lib/localDb'; // Adjust path based on your setup
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/lib/authOptions';

export async function GET(request: Request) {
  try {
    // Supondo que você tenha uma função para obter o usuário autenticado
   // const userId = /* lógica para obter o ID do usuário autenticado */;
   const session = await getServerSession(authOptions);
   
   const sessionUser = session?.user.id

   console.log('request', request)

    const userPhone = await prisma.user_phone.findUnique({
      where: { user_id: 1 },
    });

    if (!userPhone) {
      return NextResponse.json(
        { error: 'Configurações de telefone não encontradas para o usuário' },
        { status: 404 }
      );
    }

    return NextResponse.json(userPhone, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao buscar os dados do usuário' },
      { status: 500 }
    );
  }
}
