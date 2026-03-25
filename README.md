# Личный кабинет системы доставки продуктов питания

Проект соответствует требованиям лабораторной работы: backend на Node.js + TypeScript, frontend на React + TypeScript, общий пакет типов, JWT-авторизация, Swagger, PostgreSQL, Docker, frontend в контейнере nginx, backend в виде микросервисов.

## Состав проекта

- `shared` - общий пакет типов
- `services/auth-service` - регистрация, вход, профиль пользователя, JWT
- `services/catalog-service` - каталог продуктов
- `services/orders-service` - заказы пользователя
- `frontend` - клиентское приложение React + TypeScript
- `db/init.sql` - инициализация PostgreSQL

## Таблицы PostgreSQL

- `users`
- `products`
- `orders`
- `order_items`

## Запуск

1. Скопировать `.env.example` в `.env`
2. Выполнить:

```bash
docker compose up --build
```

## Адреса

- Frontend: `http://localhost:8080`
- Auth Swagger: `http://localhost:4001/docs`
- Catalog Swagger: `http://localhost:4002/docs`
- Orders Swagger: `http://localhost:4003/docs`

## Тестовый пользователь

- Email: `anna@example.com`
- Пароль: `password123`

## Переменные окружения

Используются значения из файла `.env`.

## Основные сценарии

- регистрация пользователя
- вход и получение JWT
- просмотр каталога продуктов
- оформление заказа
- просмотр своих заказов
- отмена своего заказа
- просмотр профиля

## Технологии

- Node.js
- TypeScript
- Express
- React
- Vite
- PostgreSQL
- Docker
- Swagger UI
- nginx
