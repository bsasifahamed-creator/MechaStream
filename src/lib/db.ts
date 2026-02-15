import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var prismaPool: Pool | undefined
}

function createPrismaClient() {
  const connectionString =
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/auth_db?schema=public'

  const pool = global.prismaPool ?? new Pool({ connectionString })
  if (process.env.NODE_ENV !== 'production') {
    global.prismaPool = pool
  }

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const db =
  global.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db
}
