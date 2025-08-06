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

## Быстрый старт

### 1. Настройка базы данных

```bash
# Запуск PostgreSQL
docker-compose up postgres -d

# Инициализация базы данных
chmod +x init-database.sh
./init-database.sh

# Настройка Prisma
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 2. Запуск приложений

```bash
# Backend (порт 3000)
cd backend && npm run start:dev

# Frontend (порт 3000) - будет создан позже
cd frontend && npm run dev
```

### 3. Документация

- 📖 [Настройка базы данных](DATABASE_SETUP.md) - подробная инструкция
- 🔧 [API документация](#функциональность) - описание endpoints

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
