import pkg from '@prisma/client'
import { fileURLToPath } from 'node:url'

const { PrismaClient } = pkg

let adapter
if (process.env.NODE_ENV !== 'production') {
  try {
    const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3')
    const dbPath = fileURLToPath(new URL('../dev.db', import.meta.url))
    adapter = new PrismaBetterSqlite3({ url: dbPath })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to load sqlite adapter:', e)
  }
}

// Prisma 7 standard initialization
// If DATABASE_URL is in process.env, Prisma will use it automatically
export const prisma = new PrismaClient(
  adapter ? { adapter } : {}
)
