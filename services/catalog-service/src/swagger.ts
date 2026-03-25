export const catalogOpenApi = {
  openapi: '3.0.0',
  info: {
    title: 'Catalog Service API',
    version: '1.0.0',
    description: 'Микросервис каталога продуктов'
  },
  servers: [
    {
      url: 'http://localhost:4002'
    }
  ],
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          price: { type: 'number' },
          imageUrl: { type: 'string' }
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
    '/api/catalog/products': {
      get: {
        summary: 'Список продуктов',
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' }
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Список продуктов',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' }
                }
              }
            }
          }
        }
      }
    },
    '/api/catalog/products/{id}': {
      get: {
        summary: 'Продукт по идентификатору',
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
            description: 'Продукт',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' }
              }
            }
          },
          '404': {
            description: 'Не найден',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    }
  }
}
