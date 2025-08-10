# Frontend (Next.js) — TrueCode

Next.js 15 + TypeScript + React Query + Tailwind CSS. UI для управления товарами и загрузки изображений.

## Запуск локально

```bash
npm install
npm run dev
```

Приложение доступно на `http://localhost:3000`.

## Переменные окружения

Создайте `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## Тесты

```bash
npm run test           # запустить тесты
npm run test:watch     # watch-режим
npm run test:coverage  # покрытие
```

Подробнее: [TESTING.md](./TESTING.md)

## Сборка и запуск

```bash
npm run build
npm start
```

## Деплой

Рекомендуем Vercel. Укажите переменную окружения `NEXT_PUBLIC_API_URL` с адресом backend API.
