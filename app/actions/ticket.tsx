'use server'

import prisma from '@/app/lib/localDb'
import { getServerSession } from "next-auth";
import { authOptions } from '../lib/authOptions';
import { Ticket_status, Prisma, Ticket_time  } from '@prisma/client';

export async function createTicket({company_id}:{company_id:number}){
  const session = await getServerSession(authOptions);

  if(session){
    const ticket = await prisma.ticket.create({
      data: { company_id, status: 'triage', user_id: session.user.id, procedures: JSON.stringify([]), communication_type: `chat`  },
    }) 
    return JSON.stringify(ticket)
  }
}

export async function cloneTicket(ticket:TicketWithTime){
  const session = await getServerSession(authOptions);
  if(session){
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {id, ticket_time, ...clone} = ticket
    
    const newTicket = await prisma.ticket.create({
      data: {...clone,  status: 'triage', user_id: session.user.id, procedures: JSON.stringify([]), type: undefined},
    }) 
    return {...newTicket, ticket_time: []}
  }
}

export async function updateTicket(ticket: TicketWithTime){
  if(ticket){
    const {company_id, status, procedures, erpProtocol, address, caller_name, client_name, identity_document, isRecall, communication_id, type, caller_number, ticket_time, idGestor, subject  } = ticket
    await prisma.ticket.update({
      where: {
        id: ticket.id
      },
      data: { company_id, status, procedures, erpProtocol, address, caller_name, client_name, identity_document, isRecall, communication_id, type: type, caller_number, idGestor, subject  },
    })
    
    ticket_time.forEach(async (el:Ticket_time) => {
      await saveTicketTime({...el})
    })
    
  }  
}


export const getOpenTickets = async ():Promise<TicketWithTime[]> => { 
  const session = await getServerSession(authOptions);

  if(session){
    const filteredTickets = await prisma.ticket.findMany({
      where: {
        user_id: session.user.id,
        status: { notIn: ['closed', 'deleted']  },
      },      
      include:{ticket_time: true}
    });
    return filteredTickets
  }
  return []
}

export const getLastClosedTickets = async ():Promise<TicketWithTime[]> => { 
  const session = await getServerSession(authOptions);

  if(session){
    const filteredTickets = await prisma.ticket.findMany({
      take:5,
      where: {
        user_id: session.user.id,
        status: 'closed' ,
      },
      orderBy: [
        {
          createdAt: 'desc'
        }
      ],
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
    ticket_time = await saveTicketTime({ticket_id, ticket_status: ticketStatus, time:0})
  }
  return ticket_time
}

export async function saveTicketTime({ticket_id, ticket_status, time}:{ticket_id:number, ticket_status: Ticket_status, time: number} ){
  
  const ticketTime = prisma.ticket_time.upsert({
    where:{
      ticket_id_ticket_status: {ticket_id, ticket_status}
    },
    create:{ticket_id, ticket_status, time},
    update:{ticket_id, ticket_status, time}
  }) 
  return ticketTime

}

export async function getTicketsByDate(date: Date){
  const session = await getServerSession(authOptions);  

  if(session){
    const tickets = prisma.ticket.findMany({
      where:{
        user_id: session.user.id,
        status: { notIn: [ 'deleted']  },
        createdAt: {
          gt: date
        }
      },
      include:{ticket_time: true}
    })
    return tickets
  }
}