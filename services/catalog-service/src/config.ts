import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT || 4002),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/grocery_delivery',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080'
}
