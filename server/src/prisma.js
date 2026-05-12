import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'node:url'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const dbPath = fileURLToPath(new URL('../dev.db', import.meta.url))
const adapter = new PrismaBetterSqlite3({ url: dbPath })

export const prisma = new PrismaClient({ adapter })

