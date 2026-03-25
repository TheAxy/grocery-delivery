import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { CreateOrderRequest, Order, OrderItem } from '@grocery-delivery/shared'
import { PoolClient } from 'pg'
import { requireAuth } from './auth'
import { config } from './config'
import { pool } from './db'
import { ordersOpenApi } from './swagger'

interface ProductRow {
  id: number
  name: string
  price: number
}


type AsyncHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<unknown>

const asyncHandler = (handler: AsyncHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

const app = express()

app.use(helmet())
app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(ordersOpenApi))
app.get('/openapi.json', (_req, res) => {
  res.json(ordersOpenApi)
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

async function buildOrders(userId: number): Promise<Order[]> {
  const ordersResult = await pool.query(
    `SELECT id, user_id AS "userId", delivery_address AS "deliveryAddress",
            status, total::float AS total, created_at AS "createdAt"
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  )

  const itemsResult = await pool.query(
    `SELECT oi.order_id AS "orderId", oi.product_id AS "productId", p.name AS "productName",
            oi.quantity, oi.price::float AS price,
            (oi.quantity * oi.price)::float AS total
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     JOIN orders o ON o.id = oi.order_id
     WHERE o.user_id = $1
     ORDER BY oi.order_id, oi.id`,
    [userId]
  )

  const itemsMap = new Map<number, OrderItem[]>()

  for (const row of itemsResult.rows as Array<OrderItem & { orderId: number }>) {
    const items = itemsMap.get(row.orderId) || []
    items.push({
      productId: row.productId,
      productName: row.productName,
      quantity: row.quantity,
      price: Number(row.price),
      total: Number(row.total)
    })
    itemsMap.set(row.orderId, items)
  }

  return ordersResult.rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    deliveryAddress: row.deliveryAddress,
    status: row.status,
    total: Number(row.total),
    createdAt: new Date(row.createdAt).toISOString(),
    items: itemsMap.get(row.id) || []
  }))
}

async function createOrder(client: PoolClient, userId: number, payload: CreateOrderRequest): Promise<Order> {
  const productIds = Array.from(new Set(payload.items.map((item) => item.productId)))
  const productsResult = await client.query(
    `SELECT id, name, price::float AS price
     FROM products
     WHERE id = ANY($1::int[])`,
    [productIds]
  )

  const products = productsResult.rows as ProductRow[]
  if (products.length !== productIds.length) {
    throw new Error('Некоторые продукты не найдены')
  }

  const productMap = new Map(products.map((product) => [product.id, product]))
  const items: OrderItem[] = payload.items.map((item) => {
    const product = productMap.get(item.productId)
    if (!product) {
      throw new Error('Некоторые продукты не найдены')
    }

    return {
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      price: Number(product.price),
      total: Number(product.price) * item.quantity
    }
  })

  const total = items.reduce((sum, item) => sum + item.total, 0)

  const orderResult = await client.query(
    `INSERT INTO orders (user_id, delivery_address, status, total)
     VALUES ($1, $2, 'created', $3)
     RETURNING id, user_id AS "userId", delivery_address AS "deliveryAddress",
               status, total::float AS total, created_at AS "createdAt"`,
    [userId, payload.deliveryAddress, total]
  )

  const order = orderResult.rows[0]

  for (const item of items) {
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES ($1, $2, $3, $4)`,
      [order.id, item.productId, item.quantity, item.price]
    )
  }

  return {
    id: order.id,
    userId: order.userId,
    deliveryAddress: order.deliveryAddress,
    status: order.status,
    total: Number(order.total),
    createdAt: new Date(order.createdAt).toISOString(),
    items
  }
}

app.get('/api/orders', requireAuth, asyncHandler(async (req, res) => {
  const orders = await buildOrders(req.userId as number)
  res.json(orders)
}))

app.post('/api/orders', requireAuth, asyncHandler(async (req, res) => {
  const body = req.body as CreateOrderRequest
  const deliveryAddress = body.deliveryAddress?.trim()
  const items = Array.isArray(body.items) ? body.items : []

  if (!deliveryAddress || !items.length) {
    res.status(400).json({ message: 'Нужно указать адрес доставки и товары' })
    return
  }

  if (items.some((item) => !Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
    res.status(400).json({ message: 'Некорректные позиции заказа' })
    return
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const order = await createOrder(client, req.userId as number, { deliveryAddress, items })
    await client.query('COMMIT')
    res.status(201).json(order)
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(400).json({ message: error instanceof Error ? error.message : 'Не удалось создать заказ' })
  } finally {
    client.release()
  }
}))

app.patch('/api/orders/:id/cancel', requireAuth, asyncHandler(async (req, res) => {
  const orderId = Number(req.params.id)
  if (!Number.isInteger(orderId)) {
    res.status(400).json({ message: 'Некорректный идентификатор заказа' })
    return
  }

  const result = await pool.query(
    `UPDATE orders
     SET status = 'cancelled'
     WHERE id = $1 AND user_id = $2 AND status = 'created'
     RETURNING id`,
    [orderId, req.userId as number]
  )

  if (!result.rowCount) {
    res.status(404).json({ message: 'Заказ не найден или уже отменён' })
    return
  }

  const orders = await buildOrders(req.userId as number)
  const order = orders.find((item) => item.id === orderId)

  if (!order) {
    res.status(404).json({ message: 'Заказ не найден' })
    return
  }

  res.json(order)
}))

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
  res.status(500).json({ message })
})

app.listen(config.port, () => {
  console.log(`Orders service started on port ${config.port}`)
})
