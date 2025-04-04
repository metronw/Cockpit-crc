'use server'

import connection from '@/app/lib/db';
import prisma from '@/app/lib/localDb'
import { IProcedureItemResponse } from '../agent/providers';
import { Ticket_status } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from '../lib/authOptions';
import { TicketWithTime, getOpenTickets, updateTicket } from './ticket';
import { IUser } from './userAssign';
import { Company } from '@prisma/client'
import { ITicketType } from '../providers';
import { CompanyWithAssignments } from './company';
import nodemailer from "nodemailer";
import bcrypt from 'bcrypt'; // Assuming passwords are hashed in the database

export async function getCrcTicketTypes() {
  const [rows] = await connection.query('SELECT ticket_type.description as label, ticket_type.id, ticket_type.id_father FROM ticket_type '
    + 'INNER JOIN ticket_type_product ON ticket_type_product.id_ticket_type=ticket_type.id '
    + 'where ticket_type_product.id_product = 2 '
  );
  return rows as ITicketType[];
}

export async function getCrcFatherTicketTypes() {
  const [rows] = await connection.query('SELECT ticket_type.description as label, ticket_type.id FROM ticket_type '
    + 'INNER JOIN ticket_type_product ON ticket_type_product.id_ticket_type=ticket_type.id '
    + 'where ticket_type_product.id_product = 2 AND ticket_type.id = ticket_type.id_father'
  );
  return JSON.stringify(rows);
}



// async function getApiCredentials(){
//   return {
//     token: '5b7efd3d9402cc18ces9g4l1',
//     password:'123456'
//   }
// }  


export async function getCompaniesList() {

  const [rows] = await connection.query('SELECT client.* FROM client ' +
    'INNER JOIN contract ON contract.id_client = client.id' +
    ' INNER JOIN contract_product ON contract_product.id_contract = contract.id' +
    ' WHERE client.status >= 1 AND contract_product.id_product = 2 '
  )
  return rows as Company[]
  // $client = Client::leftJoin('contract', 'contract.id_client', '=', 'client.id')
  //   ->leftJoin('contract_product', 'contract_product.id_contract', '=', 'contract.id')
  //   ->select('client.*')
  //   ->where('client.status', '>=' ,1)
  //   ->where('contract_product.id_product', '2')
  //   ->orderBy('fantasy_name')
  //   ->get();

}





export async function getTicketContext(user_id: number | undefined): Promise<{ companies: CompanyWithAssignments[], tickets: TicketWithTime[] }> {
  if (user_id) {
    
    const companaes = await prisma.company.findMany({
      where: {
        User_assign: {
          some: {
            user_id,            
          }
        }
      },
      include: {
        User_assign: {
          where: {
            user_id
          }
        } 
      },
    });

    const tickets: TicketWithTime[] = await getOpenTickets()

    return { companies: companaes, tickets }

  }
  return { companies: [], tickets: [] }
}

function formatProcedures(procedures: string) {
  let resp = ''
  JSON.parse(procedures).forEach((el: IProcedureItemResponse) => {
    resp += `${el.label}:  ${el.response} \n`
  })

  return resp
}


export async function getMetroId(email: string): Promise<number> {

  try{
      const [result] = await connection.query(
        `SELECT * FROM users where email='${email}';`
      )
    
      if (result) {
        const res = JSON.parse(JSON.stringify(result))
        
        let metro_id = 312
        if(res.length == 0 ){
          const newPass = bcrypt.hashSync('951Mudar!', 10)
          const [newUser] = await connection.query(
            `INSERT INTO users (email, id_sector, name, password, created_at, updated_at) VALUES ('${email}', 5, '${email}', '${newPass}', NOW(), NOW() );`
          )
          const usr = JSON.parse(JSON.stringify(newUser))
          metro_id = usr.insertId
        }else{
          metro_id = res[0].id
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          await prisma.user.update({
            where: { email },
            data: { metro_id },
          });
        }
        return metro_id
      }

  }catch(err){
    return 312
  }
  return 312
}

export async function createMetroTicket(ticketInfo: TicketWithTime | undefined, isSolved: boolean) {

  try {
    if (ticketInfo) {
      const { type, erpProtocol, company_id, client_name, procedures, address, communication_id, communication_type, caller_number, trunk_name, caller_name, isRecall, identity_document, subject } = ticketInfo

      if (
        !!type && !!company_id
      ) {
        const session = await getServerSession(authOptions);
        const erp_protocol = !!erpProtocol ? erpProtocol.length > 0 ? erpProtocol : null : null
        const caller_number_insert = !!caller_number ? caller_number.length > 0 ? caller_number : null : null
        const call_id = communication_type == `phone` ? communication_id : "NULL"
        const chat_protocol = communication_type == `chat` ? communication_id : "NULL"
        const subjectCRC = `Atendimento CRC, ERP #${erpProtocol}`
        const companyName = await prisma.company.findUnique({ where: { id: company_id } }).then(res => res?.fantasy_name)
        const origin = communication_type == 'chat' ? 0 : communication_type == `phone` ? 1 : 0
        const id_ticket_status = isSolved ? 4 : 6;

        const [result] = await connection.query(
          `INSERT INTO ticket (id_client, id_ticket_status, subject, id_product, origem, id_ticket_type, created_by, erp_protocol, phone, created_at, updated_at, user_owner, call_id, chat_protocol ) ` +
          `VALUES (${company_id}, ${id_ticket_status}, '${subjectCRC}', 2, ${origin}, ${type}, ${session?.user.metro_id ?? 312}, '${erp_protocol}', '${caller_number_insert}', NOW(), NOW(), ${session?.user.metro_id ?? 312}, ${call_id}, '${chat_protocol}' )`
        )

        let idGestor = 0;

        if (result) {
          const res = JSON.parse(JSON.stringify(result))
          idGestor = res.insertId; // Definir idGestor antes de usá-lo

          const message =
            `
              ${companyName} - Tronco ${trunk_name}
              Nome do assinante: ${client_name}
              Documento: ${identity_document}
              Tipo de atendimento: Telefone
              Nome do solicitante: ${caller_name}
              Endereço: ${address?.replace(/'/g, `''`)}
              Problema alegado: ${subject}
              Procedimentos realizados: 
              ${formatProcedures(procedures ?? `[]`)}
              Data/horários: ${(new Date).toLocaleString()}
              Telefone: ${caller_number}
              Protocolo ERP: ${erpProtocol}
              Rechamada? ${isRecall ? 'Sim' : 'Não'}
              Nome do atendente: ${session?.user.name}
            `

          await connection.query(
            `INSERT INTO ticket_response (id_ticket, response, type, id_user, created_at, updated_at) ` +
            `VALUES (${res.insertId}, '${message}', 'N', ${session?.user.metro_id ?? 312}, NOW(), NOW() )`
          )

        }
        await updateTicket({...ticketInfo, status: 'closed' as Ticket_status, idGestor}) 

        return { status: 200, message: 'ticket criado com sucesso' }

      }
      return ({ status: 400, message: 'dados errados' })

    }
    return { status: 400, message: 'Nenhum ticket foi enviado' }
  } catch (err) {
    const error = err as Error;
    return { status: 500, message: error.message }
  }
}

export async function getUsers() {
  const session = await getServerSession(authOptions);

  if (session) {
    const filteredUsers = await prisma.user.findMany({
    });

    return filteredUsers as IUser[]
  }
  return []
}


export async function sendEmail({to, subject, message, attachments, cc, priority}: {to: string, subject: string, message: string, attachments?: string, cc?: string, priority?: 'high' | 'normal' | 'low'}) {

  let attachmentOptions: { filename: string; content: Buffer }[] = [];

  if (attachments) {
    try {
      const response = await fetch(attachments);
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
      
      const fileBuffer = await response.arrayBuffer(); // Convert file to buffer
      attachmentOptions = [
        {
          filename: attachments,
          content: Buffer.from(fileBuffer)
        },
      ];
    } catch (error) {
      console.error("Attachment fetching error:", error);
    }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_PORT === "465", // Use SSL for port 465
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    text: message,
    attachments: attachmentOptions,
    cc,
    priority,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, message: "Email failed to send." };
  }
}

export async function postToTeams({ title, text }: { title: string, text: string }) {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;

  const payload = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "summary": title,
    "themeColor": "0076D7",
    "title": title,
    "text": text
  };

  try {
    if (!webhookUrl) {
      throw new Error('TEAMS_WEBHOOK_URL is not defined');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to post to Teams: ${response.statusText}`);
    }

    return { success: true, message: "Message posted to Teams successfully!" };
  } catch (error) {
    console.error("Teams posting error:", error);
    return { success: false, message: "Failed to post message to Teams." };
  }
}

