import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  try {

    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    
    await db.$connect()
    console.log("Conectado com sucesso!")
  } catch (e) {
    console.error("Erro de conexão:", e)
  } finally {
    await db.$disconnect()
  }
}

main()