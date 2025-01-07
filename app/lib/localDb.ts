import { PrismaClient, Queue, Company } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma
export type { Queue, Company } // Adicionada exportação do tipo Company