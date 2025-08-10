# 🚀 TrueCode - Full-Stack приложение

Современное веб-приложение для управления товарами с использованием NestJS (backend) и Next.js (frontend).

## 📋 Описание

TrueCode - это полнофункциональное приложение для управления товарами с возможностью:

- ✅ Создание, редактирование и удаление товаров
- ✅ Загрузка изображений товаров
- ✅ Поиск и фильтрация товаров
- ✅ Пагинация результатов
- ✅ Сортировка по различным параметрам
- ✅ Современный и отзывчивый UI

## 🛠️ Технологии

### Backend

- **NestJS** - современный Node.js фреймворк
- **PostgreSQL** - реляционная база данных
- **Prisma** - ORM для работы с базой данных
- **Docker** - контейнеризация

### Frontend

- **Next.js 15** - React фреймворк
- **TypeScript** - типизированный JavaScript
- **Tailwind CSS** - утилитарный CSS фреймворк
- **React Query** - управление состоянием
- **React Hook Form** - управление формами

## 🚀 Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий**:

```bash
git clone https://github.com/your-username/truecode.git
cd truecode
```

2. **Запустите с помощью Docker Compose**:

```bash
docker-compose up -d
```

3. **Откройте в браузере**:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3002
- PostgreSQL: localhost:5433

### Ручная установка

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🌐 Развертывание

Проект готов к развертыванию на облачных платформах:

- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render
- **База данных**: PostgreSQL на Railway/Render
- **Файловое хранилище**: Cloudinary, AWS S3

📖 **Подробное руководство по развертыванию**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📁 Структура проекта

```
truecode/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── products/       # Модуль товаров
│   │   ├── prisma/         # Настройки Prisma
│   │   └── main.ts         # Точка входа
│   ├── prisma/
│   │   └── schema.prisma   # Схема базы данных
│   └── __tests__/          # Тесты
├── frontend/               # Next.js приложение
│   ├── src/
│   │   ├── app/           # App Router
│   │   ├── components/    # React компоненты
│   │   ├── lib/           # Утилиты и API
│   │   └── types/         # TypeScript типы
│   └── public/            # Статические файлы
├── docker-compose.yml      # Docker конфигурация
└── DEPLOYMENT.md          # Руководство по развертыванию
```

## 🧪 Тестирование

### Backend тесты

```bash
cd backend
npm run test              # Все тесты
npm run test:unit         # Unit тесты
npm run test:integration  # Integration тесты
npm run test:performance  # Performance тесты
```

Подробнее: [backend/TESTING.md](./backend/TESTING.md)

### Frontend тесты

```bash
cd frontend
npm run test
```

Подробнее: [frontend/TESTING.md](./frontend/TESTING.md)

## 📊 API Документация

### Товары

#### Получить список товаров

```
GET /products
Query параметры:
- page: номер страницы
- limit: количество товаров на странице
- search: поиск по названию
- sortBy: поле для сортировки
- sortOrder: asc/desc
- minPrice: минимальная цена
- maxPrice: максимальная цена
```

#### Получить товар по UID

```
GET /products/:uid
```

#### Создать товар

```
POST /products
Body: {
  "name": "Название товара",
  "description": "Описание",
  "price": 1000
}
```

#### Обновить товар

```
PATCH /products/:uid
Body: {
  "name": "Новое название",
  "price": 1500
}
```

#### Удалить товар

```
DELETE /products/:uid
```

#### Загрузить изображение

```
POST /products/:uid/image
Content-Type: multipart/form-data
```

## 🔧 Переменные окружения

### Backend

```env
DATABASE_URL=postgresql://truecode:truecode@localhost:5433/truecode
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект лицензирован под MIT License.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

- Создайте Issue в GitHub
- Обратитесь к [DEPLOYMENT.md](./DEPLOYMENT.md) для вопросов по развертыванию

---

⭐ **Не забудьте поставить звездочку репозиторию, если он вам понравился!**
