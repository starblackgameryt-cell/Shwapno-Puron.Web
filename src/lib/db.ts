import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For Turso cloud deployment, use driver adapter
// For local dev, use standard Prisma client
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''
  const isTurso = databaseUrl.startsWith('libsql://')

  if (isTurso) {
    // Dynamic import for Turso cloud (used in production/serverless)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    
    const libsql = createClient({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    })
    const adapter = new PrismaLibSQL(libsql)
    
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'production' ? [] : ['error', 'warn'],
    })
  }

  // Standard SQLite client for local development
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['error', 'warn'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
