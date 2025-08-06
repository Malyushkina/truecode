# Настройка базы данных TrueCode

## Обзор

Данный документ описывает процесс настройки PostgreSQL базы данных для проекта TrueCode.

## Предварительные требования

- Docker и Docker Compose установлены
- Проект склонирован в директорию `truecode`

## Шаг 1: Запуск PostgreSQL

### 1.1 Запуск контейнера

```bash
# Переходим в корневую директорию проекта
cd /path/to/truecode

# Запускаем PostgreSQL контейнер
docker-compose up postgres -d
```

### 1.2 Проверка статуса

```bash
# Проверяем, что контейнер запущен
docker ps

# Проверяем логи PostgreSQL
docker logs truecode_postgres
```

## Шаг 2: Инициализация базы данных

### 2.1 Автоматическая инициализация

```bash
# Делаем скрипт исполняемым
chmod +x init-database.sh

# Запускаем автоматическую инициализацию
./init-database.sh
```

### 2.2 Что делает скрипт

Скрипт `init-database.sh` выполняет следующие действия:

1. ✅ Проверяет запуск PostgreSQL контейнера
2. ✅ Создает пользователя `truecode` с паролем `truecode`
3. ✅ Создает базу данных `truecode`
4. ✅ Настраивает права доступа
5. ✅ Проверяет подключение

### 2.3 Ручная инициализация (если скрипт не работает)

```bash
# Подключаемся к PostgreSQL как postgres
docker exec -it truecode_postgres psql -U postgres

# Выполняем SQL команды
CREATE USER truecode WITH PASSWORD 'truecode';
CREATE DATABASE truecode OWNER truecode;
GRANT ALL PRIVILEGES ON DATABASE truecode TO truecode;
\c truecode;
GRANT ALL ON SCHEMA public TO truecode;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO truecode;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO truecode;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO truecode;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO truecode;
\q
```

## Шаг 3: Настройка Prisma

### 3.1 Переход в backend директорию

```bash
cd backend
```

### 3.2 Создание миграций

```bash
# Создаем и применяем миграцию
npx prisma migrate dev --name init

# Если возникает ошибка с shadow database, используем:
npx prisma migrate dev --name init --create-only
npx prisma migrate deploy
```

### 3.3 Генерация Prisma клиента

```bash
# Генерируем TypeScript клиент для Prisma
npx prisma generate
```

## Шаг 4: Проверка настройки

### 4.1 Проверка таблиц

```bash
# Подключаемся к базе данных
docker exec -it truecode_postgres psql -U truecode -d truecode

# Просматриваем таблицы
\dt

# Выходим
\q
```

### 4.2 Запуск Prisma Studio

```bash
# Открываем веб-интерфейс для просмотра данных
npx prisma studio
```

## Параметры подключения

### База данных

- **Хост**: localhost
- **Порт**: 5433
- **База данных**: truecode
- **Пользователь**: truecode
- **Пароль**: truecode
- **URL**: `postgresql://truecode:truecode@localhost:5433/truecode`

### Переменные окружения

Файл `backend/.env` должен содержать:

```env
DATABASE_URL="postgresql://truecode:truecode@localhost:5433/truecode"
```

## Устранение проблем

### Проблема: "role postgres does not exist"

**Решение**: Пересоздайте контейнер с правильными настройками

```bash
docker-compose down
docker volume rm truecode_postgres_data
docker-compose up postgres -d
sleep 10
./init-database.sh
```

### Проблема: "permission denied to create database"

**Решение**: Дайте права на создание баз данных

```bash
docker exec -it truecode_postgres psql -U postgres -c "ALTER USER truecode CREATEDB;"
```

### Проблема: Shadow database error

**Решение**: Используйте флаг `--create-only`

```bash
npx prisma migrate dev --name init --create-only
npx prisma migrate deploy
```

## Структура базы данных

### Таблица Product

```sql
CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "discountPrice" DOUBLE PRECISION,
  "sku" TEXT NOT NULL,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Product_sku_key" UNIQUE ("sku")
);
```

## Следующие шаги

После успешной настройки базы данных:

1. ✅ Запустите backend сервер: `npm run start:dev`
2. ✅ Протестируйте API endpoints
3. ✅ Создайте frontend приложение
4. ✅ Интегрируйте frontend с backend

## Полезные команды

### Управление контейнерами

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Просмотр логов
docker-compose logs postgres
```

### Работа с базой данных

```bash
# Подключение к базе данных
docker exec -it truecode_postgres psql -U truecode -d truecode

# Резервное копирование
docker exec truecode_postgres pg_dump -U truecode truecode > backup.sql

# Восстановление
docker exec -i truecode_postgres psql -U truecode -d truecode < backup.sql
```
