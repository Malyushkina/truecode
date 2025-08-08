# 🌱 Заполнение базы данных

## 📋 Способы заполнения БД

### Способ 1: Через Prisma Seed (Рекомендуется)

```bash
# Переходим в папку backend
cd backend

# Генерируем Prisma клиент
npm run db:generate

# Запускаем миграции
npm run db:migrate

# Заполняем базу данных
npm run db:seed
```

### Способ 2: Через SQL скрипты

```bash
# Подключаемся к PostgreSQL
psql -U truecode -d truecode

# Выполняем SQL скрипт
\i sql/create-tables.sql
```

### Способ 3: Через Docker

```bash
# Запускаем контейнеры
docker-compose up -d

# Подключаемся к контейнеру с базой данных
docker exec -it truecode_postgres psql -U truecode -d truecode

# Выполняем SQL скрипт
\i /app/sql/create-tables.sql
```

## 🎯 Что добавляется в базу данных

### Продукты:

1. **iPhone 15 Pro Max** - 149,999₽ (скидка: 129,999₽)
2. **MacBook Pro 14** - 249,999₽ (скидка: 229,999₽)
3. **AirPods Pro 2** - 29,999₽ (скидка: 24,999₽)
4. **iPad Air** - 89,999₽ (скидка: 79,999₽)
5. **Apple Watch Series 9** - 49,999₽ (скидка: 44,999₽)
6. **Samsung Galaxy S24 Ultra** - 159,999₽ (скидка: 139,999₽)
7. **Dell XPS 13 Plus** - 189,999₽ (скидка: 169,999₽)
8. **Sony WH-1000XM5** - 39,999₽ (скидка: 34,999₽)

## 🔧 Проверка данных

### Через API:

```bash
# Получить все продукты
curl http://localhost:3002/products

# Получить продукт по ID
curl http://localhost:3002/products/1
```

### Через базу данных:

```sql
-- Подключиться к БД
psql -U truecode -d truecode

-- Посмотреть все продукты
SELECT * FROM "Product";

-- Посчитать количество
SELECT COUNT(*) FROM "Product";
```

## 🛠️ Полезные команды

```bash
# Очистить базу данных
npm run db:seed

# Сбросить и пересоздать базу
npx prisma migrate reset

# Посмотреть статус миграций
npx prisma migrate status

# Открыть Prisma Studio
npx prisma studio
```

## 📊 Структура данных

### Таблица Product:

- `id` - Уникальный ID (автоинкремент)
- `uid` - Уникальный строковый идентификатор
- `name` - Название товара
- `description` - Описание товара
- `price` - Основная цена
- `discountPrice` - Цена со скидкой
- `sku` - Артикул товара
- `imageUrl` - Путь к изображению
- `createdAt` - Дата создания
- `updatedAt` - Дата обновления

## 🆘 Устранение неполадок

### Ошибка подключения к БД:

1. Проверьте, что PostgreSQL запущен
2. Убедитесь, что переменная `DATABASE_URL` настроена
3. Проверьте права доступа пользователя

### Ошибка миграций:

1. Удалите папку `node_modules/.prisma`
2. Запустите `npm run db:generate`
3. Запустите `npm run db:migrate`

### Ошибка seed:

1. Убедитесь, что Prisma клиент сгенерирован
2. Проверьте подключение к базе данных
3. Запустите `npm run db:seed`

---

🎉 **Готово!** База данных заполнена тестовыми данными.
