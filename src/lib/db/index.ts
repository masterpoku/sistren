import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from './schema'

export const db = drizzle({
  connection: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) ?? 3306,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'root',
    database: process.env.DB_NAME ?? 'sistren',
  },
  schema,
  mode: 'default'
})

export type Database = typeof db

