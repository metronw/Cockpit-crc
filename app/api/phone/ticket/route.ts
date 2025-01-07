import { NextResponse } from 'next/server';
import prisma, { Queue } from '@/app/lib/localDb'; // Importação do tipo Queue corrigida
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/lib/authOptions';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user.id;

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Usuário não está logado' },
        { status: 401 }
      );
    }

    try {
      const { trunk_name, callid, callernum } = await request.json();

      if (!trunk_name || !callid) {
        return new Response(JSON.stringify({ status: 400, message: 'Dados insuficientes' }), { status: 400 });
      }

      // Anotação de tipo para queue
      const queue = await prisma.queue.findFirst({
        where: { trunk_name }
      });

      if (!queue) {
        return new Response(JSON.stringify({ status: 404, message: 'Fila não encontrada' }), { status: 404 });
      }

      const company_id = queue.company_id;

      // Criar o ticket
      const ticket = await prisma.ticket.create({
        data: {
          company_id,
          status: 'triage',
          user_id: sessionUser, // ID do usuário responsável ou padrão
          procedures: JSON.stringify([]),
          communication_type: 'phone',
          communication_id: callid,
          caller_number: callernum, // Pode ser preenchido com mais detalhes se disponível
          createdAt: new Date(),
          trunk_name
        },
      });

      return new Response(JSON.stringify({ status: 200, message: 'Ticket criado com sucesso', ticket }), { status: 200 });
    } catch (error) {
      const err = error as Error;
      return new Response(JSON.stringify({ status: 500, message: err.message }), { status: 500 });
    }

  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao buscar os dados do usuário' },
      { status: 500 }
    );
  }
}
