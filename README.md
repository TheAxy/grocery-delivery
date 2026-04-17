# FreshBox monorepo

Проект переведён на монорепозиторную структуру для лабораторной работы №4.

## Структура

- `shared` — общие типы для frontend и backend
- `packages/app-core` — общая frontend-логика, страницы, менеджеры состояний Redux RTK и MobX
- `packages/webpack-config` — переиспользуемая webpack-конфигурация
- `apps/host` — host-приложение с авторизацией, header, footer, переключением между microfrontend и logout
- `apps/catalog-mf` — microfrontend каталога и администрирования товаров
- `apps/account-mf` — microfrontend заказов и профиля
- `services/*` — backend-микросервисы
- `frontend` — Dockerfile и nginx-конфиг для сборки и публикации host-приложения

## Запуск

1. Заполнить `.env` по примеру `.env.example`
2. Запустить:

```bash
npm config set registry https://registry.npmjs.org/
docker compose up --build
```

Фронтенд после запуска доступен по адресу `http://localhost:8080`.

## Microfrontend-маршруты

- `/catalog` — каталог товаров
- `/catalog/admin` — управление карточками товаров администратора
- `/account/orders` — история заказов пользователя
- `/account/profile` — профиль текущего пользователя

## Переключение менеджера состояний

В `.env` можно указать:

```env
STATE_MANAGER=redux
```

или

```env
STATE_MANAGER=mobx
```

Все frontend-приложения собираются с одинаковым значением `STATE_MANAGER`.
