export const ordersOpenApi = {
  openapi: '3.0.0',
  info: {
    title: 'Orders Service API',
    version: '1.0.0',
    description: 'Микросервис заказов'
  },
  servers: [
    {
      url: 'http://localhost:4003'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      CreateOrderRequest: {
        type: 'object',
        required: ['deliveryAddress', 'items'],
        properties: {
          deliveryAddress: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productId', 'quantity'],
              properties: {
                productId: { type: 'integer' },
                quantity: { type: 'integer' }
              }
            }
          }
        }
      },
      OrderItem: {
        type: 'object',
        properties: {
          productId: { type: 'integer' },
          productName: { type: 'string' },
          quantity: { type: 'integer' },
          price: { type: 'number' },
          total: { type: 'number' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          deliveryAddress: { type: 'string' },
          status: { type: 'string' },
          total: { type: 'number' },
          createdAt: { type: 'string' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' }
          }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/api/orders': {
      get: {
        summary: 'Список заказов текущего пользователя',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Список заказов',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Order' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Создание заказа',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateOrderRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Созданный заказ',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' }
              }
            }
          }
        }
      }
    },
    '/api/orders/{id}/cancel': {
      patch: {
        summary: 'Отмена заказа',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          '200': {
            description: 'Заказ отменён',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' }
              }
            }
          }
        }
      }
    }
  }
}
