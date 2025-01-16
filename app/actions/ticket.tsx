'use server'

import prisma from '@/app/lib/localDb'
import { getServerSession } from "next-auth";
import { authOptions } from '../lib/authOptions';
import { Ticket } from '@prisma/client';

// export interface ITicket {
//   id: number;
//   client_name: string;
//   cpf: string;
//   address: string;
//   type:string;
//   erpProtocol: string;
//   complement:string;
//   status: string;
//   user_id: number;
//   company_id: number;
//   time: string;
//   createdAt:Date;
//   procedures: string;
//   caller_number: string;
//   communication_id: string;
//   communication_type: string;
//   trunk_name: string;
//   caller_name: string;
//   isRecall: boolean;
//   identity_document?: string;
// }

export async function createTicket({company_id}:{company_id:number}){
  const session = await getServerSession(authOptions);

  if(session){
    const ticket = await prisma.ticket.create({
      data: { company_id, status: 'triage', user_id: session.user.id, procedures: JSON.stringify([]), communication_type: `chat`  },
    }) 
    return JSON.stringify(ticket)
  }
}

export async function updateTicket({ticket}: {ticket: Ticket | undefined}){
  if(ticket){
    const {company_id, status, procedures, erpProtocol, address, caller_name, client_name, identity_document, isRecall, communication_id, type, caller_number  } = ticket
  
    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticket.id
      },
      data: { company_id, status, procedures, erpProtocol, address, caller_name, client_name, identity_document, isRecall, communication_id, type: type, caller_number  },
    })
  
    return JSON.stringify(updatedTicket)
  }
  
}


export const getOpenTickets = async ():Promise<Ticket[]> => {
  const session = await getServerSession(authOptions);

  if(session){
    const filteredTickets = await prisma.ticket.findMany({
      where: {
        user_id: session.user.id,
        status: { not: 'closed' }
      },
    });
    return filteredTickets
  }
  return []
}

export async function getTicket(id:number){
  const ticket = prisma.ticket.findFirst({
    where:{id}
  }) 
  return ticket
}