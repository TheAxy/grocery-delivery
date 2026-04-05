import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT || 4001),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/grocery_delivery',
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  adminLogin: process.env.ADMIN_LOGIN || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  adminName: process.env.ADMIN_NAME || 'Администратор',
  adminAddress: process.env.ADMIN_ADDRESS || 'Панель управления каталогом'
}
