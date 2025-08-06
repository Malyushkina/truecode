# TrueCode - Система управления товарами

## Описание проекта

Система управления товарами с полным CRUD функционалом, включающая backend на Nest.js и frontend на Next.js.

## Технологический стек

### Backend

- Nest.js
- Prisma ORM
- PostgreSQL
- Docker

### Frontend

- Next.js
- React
- TypeScript
- Tanstack Query
- Yup/Zod для валидации

## Структура проекта

```
truecode/
├── backend/          # NestJS приложение
├── frontend/         # Next.js приложение
├── docker-compose.yml
└── README.md
```

## Запуск проекта

```bash
# Запуск всех сервисов
docker-compose up -d

# Backend (порт 3001)
cd backend && npm run start:dev

# Frontend (порт 3000)
cd frontend && npm run dev
```

## Функциональность

### Backend

- ✅ CRUD операции для товаров
- ✅ Загрузка и удаление фотографий
- ✅ Пагинация, фильтрация, сортировка
- ✅ REST API

### Frontend

- ✅ Интерфейс управления товарами
- ✅ Каталог товаров с фильтрацией
- ✅ Страница отдельного товара
- ✅ Адаптивный дизайн
