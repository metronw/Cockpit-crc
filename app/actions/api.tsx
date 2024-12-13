'use server'

import connection from '@/app/lib/db';
import prisma from '@/app/lib/localDb'
import { ICompany, ITicket } from '../agent/providers';
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
      data: { company_id, status: 'triage', user_id: session.user.id, procedures: JSON.stringify([]) },
    })
    return JSON.stringify(ticket)
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

export async function createMetroTicket(ticketInfo:ITicket | undefined){

  try{
    if(ticketInfo){
      const { type, erp, phone, company_id, client_name} = ticketInfo

      if(
        !!type && !!company_id
      ){
        await connection.query(
          `INSERT INTO ticket (id_client, id_ticket_status, subject, id_product, origem, id_ticket_type, created_by, erp_protocol, phone )`+
          `VALUES (${company_id}, 4, "teste", 2, 0, ${parseInt(type)}, 424, ${isNaN(parseInt(erp)) ? null : parseInt(erp)}, ${isNaN(parseInt(phone)) ? null : parseInt(phone)} )`
        )
    
        await prisma.ticket.update({
          where: {
            id: ticketInfo.id,
          },
          data: { company_id, status: 'closed', user_id: 424, client_name, type: parseInt(type) },
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