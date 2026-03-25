import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { Product } from '@grocery-delivery/shared'
import { config } from './config'
import { pool } from './db'
import { catalogOpenApi } from './swagger'


type AsyncHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<unknown>

const asyncHandler = (handler: AsyncHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

const app = express()

app.use(helmet())
app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(catalogOpenApi))
app.get('/openapi.json', (_req, res) => {
  res.json(catalogOpenApi)
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/catalog/products', asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim().toLowerCase()
  const category = String(req.query.category || '').trim().toLowerCase()

  const params: unknown[] = []
  const conditions: string[] = []

  if (search) {
    params.push(`%${search}%`)
    conditions.push(`(LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`)
  }

  if (category) {
    params.push(category)
    conditions.push(`LOWER(category) = $${params.length}`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const query = `
    SELECT id, name, description, category, price::float AS price, image_url AS "imageUrl"
    FROM products
    ${whereClause}
    ORDER BY id
  `
  const result = await pool.query(query, params)
  res.json(result.rows as Product[])
}))

app.get('/api/catalog/products/:id', asyncHandler(async (req, res) => {
  const productId = Number(req.params.id)
  if (!Number.isInteger(productId)) {
    res.status(400).json({ message: 'Некорректный идентификатор продукта' })
    return
  }

  const result = await pool.query(
    `SELECT id, name, description, category, price::float AS price, image_url AS "imageUrl"
     FROM products
     WHERE id = $1`,
    [productId]
  )

  if (!result.rowCount) {
    res.status(404).json({ message: 'Продукт не найден' })
    return
  }

  res.json(result.rows[0])
}))

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
  res.status(500).json({ message })
})

app.listen(config.port, () => {
  console.log(`Catalog service started on port ${config.port}`)
})
