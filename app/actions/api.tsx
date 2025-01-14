'use server'

import connection from '@/app/lib/db';
import prisma from '@/app/lib/localDb'
import { ICompany, IProcedureItemResponse, ITicket } from '../agent/providers';
import { getServerSession } from "next-auth";
import { authOptions } from '../lib/authOptions';

export async function getCrcTicketTypes() {
  const [rows] = await connection.query('SELECT ticket_type.description as label, ticket_type.id FROM ticket_type '
    +'INNER JOIN ticket_type_product ON ticket_type_product.id_ticket_type=ticket_type.id '
    +'where ticket_type_product.id_product = 2 '
  );
  return JSON.stringify(rows);
}

export async function getCrcFatherTicketTypes() {
  const [rows] = await connection.query('SELECT ticket_type.description as label, ticket_type.id FROM ticket_type '
    +'INNER JOIN ticket_type_product ON ticket_type_product.id_ticket_type=ticket_type.id '
    +'where ticket_type_product.id_product = 2 AND ticket_type.id = ticket_type.id_father'
  );
  return JSON.stringify(rows);
}



// async function getApiCredentials(){
//   return {
//     token: '5b7efd3d9402cc18ces9g4l1',
//     password:'123456'
//   }
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

export async function updateTicket({ticket}: {ticket: ITicket | undefined}){
  if(ticket){
    const {company_id, status, procedures} = ticket
  
    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticket.id
      },
      data: { company_id, status, procedures },
    })
  
    return JSON.stringify(updatedTicket)
  }
  
}


export const getOpenTickets = async () => {
  const session = await getServerSession(authOptions);

  if(session){
    const filteredTickets = await prisma.ticket.findMany({
      where: {
        user_id: session.user.id,
        status: { not: 'closed' }
      },
    });
  
    return JSON.stringify(filteredTickets)
  }
  return '[]'
}

export async function getCompaniesList(){

  const [rows] = await connection.query('SELECT client.* FROM client '+
    'INNER JOIN contract ON contract.id_client = client.id'+
    ' INNER JOIN contract_product ON contract_product.id_contract = contract.id' +
    ' WHERE client.status >= 1 AND contract_product.id_product = 2 '
  )
  return JSON.stringify(rows)
  // $client = Client::leftJoin('contract', 'contract.id_client', '=', 'client.id')
  //   ->leftJoin('contract_product', 'contract_product.id_contract', '=', 'contract.id')
  //   ->select('client.*')
  //   ->where('client.status', '>=' ,1)
  //   ->where('contract_product.id_product', '2')
  //   ->orderBy('fantasy_name')
  //   ->get();

}

export async function getTicket(id:number){
  const ticket = prisma.ticket.findFirst({
    where:{id}
  }) 
  return ticket
}


export async function getTicketContext(user_id: number | undefined){
  if(user_id){
    const companies = JSON.parse(await getCompaniesList()) 
  
    const userAssignments = await prisma.user_assign.findMany({where:{ user_id }})
    const filteredComp =  companies.filter((el:ICompany) =>  userAssignments.find(item => item.company_id == el.id) )
    const tickets = JSON.parse(await getOpenTickets())
    
    return JSON.stringify({companies: filteredComp, tickets})
    
  }
  return JSON.stringify({companies: [], tickets:[]})
} 

function formatProcedures(procedures: string){
  let resp = ''
  JSON.parse(procedures).forEach((el:IProcedureItemResponse) =>{
    resp += `${el.label}:  ${el.response} \n`
  })

  return resp
}

export async function syncUserGestor(email: string){
  const [result] = await connection.query(
    `SELECT * FROM Users where email='${email}';`
  )

  if(result){
    const res = JSON.parse(JSON.stringify(result))
    const metro_id = res[0].id

    console.log(metro_id)
    await prisma.user.update({
      where:{email},
      data:{metro_id: metro_id}
    })
  }
}

export async function createMetroTicket(ticketInfo:ITicket | undefined){

  try{
    if(ticketInfo){
      const { type, erp, company_id, client_name, procedures, address, communication_id, communication_type, caller_number, trunk_name, caller_name, isRecall, identity_document} = ticketInfo
      
      if(
        !!type && !!company_id
        ){
        const session = await getServerSession(authOptions);
        const [result] = await connection.query(
          `INSERT INTO ticket (id_client, id_ticket_status, subject, id_product, origem, id_ticket_type, created_by, erp_protocol, phone, created_at, updated_at, user_owner )`+
          `VALUES (${company_id}, 4, "teste", 2, 0, ${parseInt(type)}, ${session?.user.metro_id ?? 312}, ${isNaN(parseInt(erp)) ? null : parseInt(erp)}, ${isNaN(parseInt(caller_number)) ? null : parseInt(caller_number)}, NOW(), NOW(), ${session?.user.metro_id ?? 312} )`
        )

        if(result){
          const res = JSON.parse(JSON.stringify(result))

        const message = 
        `
        Nome do assinante: ${client_name}
        Tipo de atendimento: Telefone
        Nome do solicitante: ${client_name}
        Endereço: ${address}
        Problema alegado: 
        Procedimentos realizados: 
        ${formatProcedures(procedures)}
        Data/horários: ${(new Date).toLocaleString()}
        Telefone: ${caller_number}
        Protocolo ERP: ${erp}
        Nome do atendente: ${session?.user.name}
        `
        
         await connection.query(
          `INSERT INTO ticket_response (id_ticket, response, type, id_user, created_at, updated_at) `+
          `VALUES (${res.insertId}, '${message}', 'N', ${session?.user.metro_id ?? 312}, NOW(), NOW() )`
         )

        }
    
        await prisma.ticket.update({
          where: {
            id: ticketInfo.id,
          },
          data: { company_id, status: 'closed', user_id: 424, client_name, type: parseInt(type), procedures, communication_id, communication_type, caller_number, trunk_name, address, caller_name, isRecall, identity_document },
        })
    
        return {status: 200, message: 'ticket criado com sucesso' }

      }
      return({status: 400, message: 'dados errados' })
  
    }
    return {status: 400, message: 'Nenhum ticket foi enviado'}
  }catch(err){
    const error = err as Error;
    return {status: 500, message: error.message }
  }
}

export async function getUsers(){
  const session = await getServerSession(authOptions);

  if(session){
    const filteredUsers = await prisma.user.findMany({
    });
  
    return JSON.stringify(filteredUsers)
  }
  return '[]'
}