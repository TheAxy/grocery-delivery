export const authOpenApi = {
  openapi: '3.0.0',
  info: {
    title: 'Auth Service API',
    version: '1.0.0',
    description: 'Микросервис авторизации и пользователей'
  },
  servers: [
    {
      url: 'http://localhost:4001'
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
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'address'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
          address: { type: 'string' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', description: 'Email пользователя или логин администратора' },
          password: { type: 'string' }
        }
      },
      UserPublic: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
          address: { type: 'string' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/UserPublic' }
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
    '/api/auth/register': {
      post: {
        summary: 'Регистрация пользователя',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Успешная регистрация',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          '400': {
            description: 'Ошибка валидации',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Вход пользователя или администратора',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Успешный вход',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          '401': {
            description: 'Неверные учетные данные',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Получение профиля пользователя',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Профиль',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserPublic' }
              }
            }
          },
          '401': {
            description: 'Нет доступа',
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
