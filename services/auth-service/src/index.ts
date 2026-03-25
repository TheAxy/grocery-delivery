import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { LoginRequest, RegisterRequest, UserPublic } from '@grocery-delivery/shared'
import { requireAuth, signToken } from './auth'
import { config } from './config'
import { pool } from './db'
import { authOpenApi } from './swagger'


type AsyncHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<unknown>

const asyncHandler = (handler: AsyncHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

const app = express()

app.use(helmet())
app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(authOpenApi))
app.get('/openapi.json', (_req, res) => {
  res.json(authOpenApi)
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const body = req.body as RegisterRequest
  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const password = body.password?.trim()
  const address = body.address?.trim()

  if (!name || !email || !password || !address) {
    res.status(400).json({ message: 'Все поля обязательны' })
    return
  }

  if (password.length < 6) {
    res.status(400).json({ message: 'Пароль должен быть не короче 6 символов' })
    return
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, address`,
      [name, email, passwordHash, address]
    )

    const user = result.rows[0] as UserPublic
    const token = signToken(user.id)
    res.status(201).json({ token, user })
  } catch (error) {
    const message = error instanceof Error && 'code' in error && error.code === '23505'
      ? 'Пользователь с таким email уже существует'
      : 'Не удалось зарегистрировать пользователя'
    res.status(400).json({ message })
  }
}))

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const body = req.body as LoginRequest
  const email = body.email?.trim().toLowerCase()
  const password = body.password?.trim()

  if (!email || !password) {
    res.status(400).json({ message: 'Email и пароль обязательны' })
    return
  }

  const result = await pool.query(
    `SELECT id, name, email, role, address, password_hash
     FROM users
     WHERE email = $1`,
    [email]
  )

  if (!result.rowCount) {
    res.status(401).json({ message: 'Неверный email или пароль' })
    return
  }

  const row = result.rows[0] as UserPublic & { password_hash: string }
  const isValid = await bcrypt.compare(password, row.password_hash)

  if (!isValid) {
    res.status(401).json({ message: 'Неверный email или пароль' })
    return
  }

  const user: UserPublic = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    address: row.address
  }

  const token = signToken(user.id)
  res.json({ token, user })
}))

app.get('/api/auth/me', requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, email, role, address
     FROM users
     WHERE id = $1`,
    [req.userId]
  )

  if (!result.rowCount) {
    res.status(404).json({ message: 'Пользователь не найден' })
    return
  }

  res.json(result.rows[0])
}))

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
  res.status(500).json({ message })
})

app.listen(config.port, () => {
  console.log(`Auth service started on port ${config.port}`)
})
