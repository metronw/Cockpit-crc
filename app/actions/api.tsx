'use server'

import { cookies } from 'next/headers'
import connection from '@/app/lib/db';
import prisma from '@/app/lib/localDb'


export async function getCrcTicketTypes() {
  const [rows] = await connection.query('SELECT ticket_type.description as label, ticket_type.id FROM ticket_type '
    +'INNER JOIN ticket_type_product ON ticket_type_product.id_ticket_type=ticket_type.id '
    +'where ticket_type_product.id_product = 2 '
  );
  return JSON.stringify(rows);
}

async function getApiCredentials(){
  return {
    token: '5b7efd3d9402cc18ces9g4l1',
    password:'123456'
  }
}  

export async function createTicket({company_id}:{company_id:number}){
  const cookieStore = await cookies()
  const user = cookieStore.get('logged_user')
  if(user){
    const user_id = 2
    const ticket = await prisma.ticket.create({
      data: { company_id, status: 'triage', user_id },
    })
    return JSON.stringify(ticket)
  }

} 

export const getOpenTickets = async () => {
  const filteredTickets = await prisma.ticket.findMany({
    where: {
      user_id: 1,
    },
  });

  return JSON.stringify(filteredTickets)
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

export async function createMetroTicket(){
  const [rows] = await connection.query('INSERT INTO ticket (id_client, id_ticket_status, subject, id_product, origem, id_ticket_type, created_by ) VALUES (220, 4, "teste", 2, 0, 92, 424 )')
  return JSON.stringify(rows)
}

// export async function login(email: string, password: string){

//   let data = await fetch('https://sys.metronetwork.com.br/login-ldap', {
//     method:'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       "email": "guilherme.below@metronetwork.com.br",
// 	    "password": 88021634      
//     })
//   })

//   const cook = data.headers.get('Set-Cookie')

//   const cookieStore = await cookies()
//   cookieStore.set('metro_gestor_session', cook)
//   // cookieStore.delete('metro_gestor_session')
//   // const cooks = cookieStore.getAll()

//   return cook
//   // redirect('/agent')
// }



// export async function getCrcTicketTypes(id:number){

//   const {token} = getApiCredentials()

//   let data = await fetch('https://localhost:8000/getTicketTypes', {
//     method:'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       }
//   })

//   console.log(data)
// }