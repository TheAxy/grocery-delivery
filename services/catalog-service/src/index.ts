import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { Product, ProductPayload } from '@grocery-delivery/shared'
import { requireAdmin } from './auth'
import { config } from './config'
import { pool } from './db'
import { catalogOpenApi } from './swagger'

type AsyncHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<unknown>

type ProductRow = {
  id: number
  name: string
  description: string
  category: string
  price: number
  imageUrl: string
}

const asyncHandler = (handler: AsyncHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

const app = express()

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    imageUrl: row.imageUrl
  }
}

type ProductPayloadValidation =
  | { error: string; value?: never }
  | {
      error?: never
      value: {
        name: string
        description: string
        category: string
        imageUrl: string
        price: number
      }
    }

function validateProductPayload(body: ProductPayload): ProductPayloadValidation {
  const name = body.name?.trim()
  const description = body.description?.trim()
  const category = body.category?.trim()
  const imageUrl = body.imageUrl?.trim()
  const price = Number(body.price)

  if (!name || !description || !category || !imageUrl) {
    return { error: 'Все поля товара обязательны' }
  }

  if (!Number.isFinite(price) || price < 0) {
    return { error: 'Цена должна быть неотрицательным числом' }
  }

  return {
    value: {
      name,
      description,
      category,
      imageUrl,
      price
    }
  }
}

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
  res.json((result.rows as ProductRow[]).map(mapProduct))
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

  res.json(mapProduct(result.rows[0] as ProductRow))
}))

app.post('/api/catalog/products', requireAdmin, asyncHandler(async (req, res) => {
  const payload = validateProductPayload(req.body as ProductPayload)
  if ('error' in payload) {
    res.status(400).json({ message: payload.error })
    return
  }

  const value = payload.value

  const result = await pool.query(
    `INSERT INTO products (name, description, category, price, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, description, category, price::float AS price, image_url AS "imageUrl"`,
    [value.name, value.description, value.category, value.price, value.imageUrl]
  )

  res.status(201).json(mapProduct(result.rows[0] as ProductRow))
}))

app.put('/api/catalog/products/:id', requireAdmin, asyncHandler(async (req, res) => {
  const productId = Number(req.params.id)
  if (!Number.isInteger(productId)) {
    res.status(400).json({ message: 'Некорректный идентификатор продукта' })
    return
  }

  const payload = validateProductPayload(req.body as ProductPayload)
  if ('error' in payload) {
    res.status(400).json({ message: payload.error })
    return
  }

  const value = payload.value

  const result = await pool.query(
    `UPDATE products
     SET name = $1, description = $2, category = $3, price = $4, image_url = $5
     WHERE id = $6
     RETURNING id, name, description, category, price::float AS price, image_url AS "imageUrl"`,
    [value.name, value.description, value.category, value.price, value.imageUrl, productId]
  )

  if (!result.rowCount) {
    res.status(404).json({ message: 'Продукт не найден' })
    return
  }

  res.json(mapProduct(result.rows[0] as ProductRow))
}))

app.delete('/api/catalog/products/:id', requireAdmin, asyncHandler(async (req, res) => {
  const productId = Number(req.params.id)
  if (!Number.isInteger(productId)) {
    res.status(400).json({ message: 'Некорректный идентификатор продукта' })
    return
  }

  try {
    const result = await pool.query(
      `DELETE FROM products
       WHERE id = $1
       RETURNING id, name, description, category, price::float AS price, image_url AS "imageUrl"`,
      [productId]
    )

    if (!result.rowCount) {
      res.status(404).json({ message: 'Продукт не найден' })
      return
    }

    res.json(mapProduct(result.rows[0] as ProductRow))
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === '23503') {
      res.status(400).json({ message: 'Нельзя удалить товар, который уже есть в заказах' })
      return
    }

    throw error
  }
}))

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
  res.status(500).json({ message })
})

app.listen(config.port, () => {
  console.log(`Catalog service started on port ${config.port}`)
})
