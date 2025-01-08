import { NextResponse } from 'next/server';
import prisma from '@/app/lib/localDb'; // Adjust path based on your setup
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/lib/authOptions';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Supondo que você tenha uma função para obter o usuário autenticado
   // const userId = /* lógica para obter o ID do usuário autenticado */;
   const session = await getServerSession(authOptions);
   
   const sessionUser = session?.user.id
   
    if (!sessionUser){
      return NextResponse.json(
        {error: 'Usuário não está logado'},
        {status: 401})
    }

    const userPhone = await prisma.user_phone.findUnique({
      where: { user_id: sessionUser },
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
