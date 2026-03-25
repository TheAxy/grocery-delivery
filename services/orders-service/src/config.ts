import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT || 4003),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/grocery_delivery',
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080'
}
