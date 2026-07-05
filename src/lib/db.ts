import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For Turso cloud deployment, use driver adapter
// For local dev, use standard Prisma client
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''
  const isTurso = databaseUrl.startsWith('libsql://')

  if (isTurso) {
    // Turso cloud (production / serverless)
    const authToken = process.env.DATABASE_AUTH_TOKEN
    if (!authToken) {
      throw new Error(
        'DATABASE_AUTH_TOKEN is required when DATABASE_URL points to Turso (libsql://). ' +
        'Set it in your environment variables (Vercel → Settings → Environment Variables).'
      )
    }

    // Prisma 6.6.0+ adapter API: pass a config object directly to PrismaLibSQL
    // (do NOT pre-create a @libsql/client instance — that API was removed in 6.6.0)
    const adapter = new PrismaLibSQL({
      url: databaseUrl,
      authToken,
    })

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'production' ? [] : ['error', 'warn'],
    })
  }

  // Standard SQLite client for local development
  // (file:// URL or no DATABASE_URL → defaults to local file)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['error', 'warn'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
