# Backend (NestJS) — TrueCode

Классический REST API для управления товарами. Использует NestJS, Prisma и PostgreSQL. Поддерживает загрузку/удаление изображений.

## Запуск локально

```bash
npm install
npm run start:dev
```

По умолчанию сервер поднимается на `http://localhost:3000`.

## Переменные окружения

Скопируйте `env.example` в `.env` и при необходимости измените значения:

```env
DATABASE_URL="postgresql://truecode:truecode@localhost:5433/truecode"
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## База данных и Prisma

```bash
# генерация клиента
npm run db:generate

# применение миграций
npm run db:migrate

# сидинг (опционально)
npm run db:seed
```

## Тесты

```bash
npm run test              # все тесты
npm run test:unit         # unit
npm run test:integration  # integration
npm run test:performance  # performance
npm run test:cov          # покрытие
```

Подробнее: [TESTING.md](./TESTING.md)

## API

Базовый префикс: `/products`

- POST `/products` — создать товар
- GET `/products` — список (фильтры, сортировка, пагинация)
- GET `/products/:uid` — получить по UID
- PATCH `/products/:uid` — обновить
- DELETE `/products/:uid` — удалить
- POST `/products/:uid/image` — загрузить изображение (multipart/form-data, поле `file`)
- DELETE `/products/:uid/image` — удалить изображение

### Параметры запроса для GET /products

- `page`, `limit`
- `search`
- `sortBy` (name|price|createdAt), `sortOrder` (asc|desc)
- `minPrice`, `maxPrice`

## CORS

Разрешённые источники берутся из `ALLOWED_ORIGINS` (список через запятую). По умолчанию разрешены `http://localhost:3000` и `http://localhost:3002`.

## Статика

Файлы из папки `uploads` доступны по пути `/uploads`.
