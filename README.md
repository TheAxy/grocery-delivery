# Личный кабинет системы доставки продуктов питания

Проект соответствует требованиям лабораторной работы: backend на Node.js + TypeScript, frontend на React + TypeScript, общий пакет типов, JWT-авторизация, Swagger, PostgreSQL, Docker, frontend в контейнере nginx, backend в виде микросервисов.

## Состав проекта

- `shared` - общий пакет типов
- `services/auth-service` - регистрация, вход, профиль пользователя, JWT, вход администратора
- `services/catalog-service` - каталог продуктов и административное управление товарами
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

## Тестовые учетные данные

Пользователь:
- Email: `anna@example.com`
- Пароль: `password123`

Администратор:
- Логин: `admin`
- Пароль: `admin123`

## Основные сценарии

- регистрация пользователя
- вход пользователя
- вход администратора
- просмотр каталога продуктов
- оформление заказа
- просмотр своих заказов
- отмена своего заказа
- просмотр профиля
- добавление товара администратором
- редактирование товара администратором
- удаление товара администратором

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
