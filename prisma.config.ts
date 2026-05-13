import 'dotenv/config'
import { defineConfig, env } from '@prisma/config'

export default defineConfig({
  schema: 'server/prisma/schema.prisma',
  engineType: 'library',
  datasource: {
    url: env('DATABASE_URL'),
  },
})

