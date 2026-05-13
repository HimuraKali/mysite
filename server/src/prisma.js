import pkg from '@prisma/client'
import { fileURLToPath } from 'node:url'

const { PrismaClient } = pkg

// For Railway we will use PostgreSQL, so the sqlite adapter is not needed in production.
// But we will keep it for local development.
let adapter
if (process.env.NODE_ENV !== 'production') {
  const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3')
  const dbPath = fileURLToPath(new URL('../dev.db', import.meta.url))
  adapter = new PrismaBetterSqlite3({ url: dbPath })
}

// In Prisma 7, the database URL is automatically picked up from the environment 
// (DATABASE_URL) based on the prisma.config.ts or schema.prisma settings.
// We should not pass 'datasources' or 'datasourceUrl' to the constructor 
// unless we are using a specific adapter or Accelerate.
export const prisma = new PrismaClient(
  adapter ? { adapter } : {}
)
