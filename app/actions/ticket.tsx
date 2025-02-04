'use server'

import prisma from '@/app/lib/localDb'
import { getServerSession } from "next-auth";
import { authOptions } from '../lib/authOptions';
import { Ticket, Ticket_status, Prisma  } from '@prisma/client';


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


export const getOpenTickets = async ():Promise<TicketWithTime[]> => {
  const session = await getServerSession(authOptions);

  if(session){
    const filteredTickets = await prisma.ticket.findMany({
      where: {
        user_id: session.user.id,
        status: { not: 'closed' },
      },
      include:{ticket_time: true}
    });
    return filteredTickets
  }
  return []
}

export async function getTicket(id:number) :Promise<TicketWithTime | null >{
  const ticket = prisma.ticket.findFirst({
    where:{id},
    include:{ticket_time: true}
  }) 
  return ticket
}

export type TicketWithTime = Prisma.TicketGetPayload<{
  include: { ticket_time: true };
}>;

export async function getTicketTime(ticket_id:number, ticketStatus: Ticket_status){
  const time = prisma.ticket_time.findFirst({
    where:{ticket_id, ticket_status:ticketStatus}
  })
  return time
  // if(time) return ({status: 200, message: time })
  // return ({status: 400, message: 'nada foi encontrado' })
}

export async function findOrCreateTicketTime(ticket_id:number, ticketStatus: Ticket_status) {
  let ticket_time = await getTicketTime(ticket_id,ticketStatus )
  if(!ticket_time){
    ticket_time = await saveTicketTime(ticket_id, ticketStatus, 0)
  }
  return ticket_time
}

export async function saveTicketTime(ticket_id:number, ticketStatus: Ticket_status, time: number ){
  
  const ticketTime = prisma.ticket_time.upsert({
    where:{
      ticket_id_ticket_status: {ticket_id, ticket_status:ticketStatus}
    },
    create:{ticket_id, ticket_status:ticketStatus, time},
    update:{ticket_id, ticket_status:ticketStatus, time}
  }) 
  return ticketTime

}