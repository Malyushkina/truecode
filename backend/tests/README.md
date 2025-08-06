# Тесты для Backend API

Этот каталог содержит полный набор тестов для приложения управления товарами.

## Структура тестов

### Unit тесты (`/unit/`)

#### DTO тесты

- **`dto/create-product.dto.spec.ts`** - Тесты валидации CreateProductDto
  - ✅ Валидация обязательных полей (name, price, sku)
  - ✅ Валидация необязательных полей (description, discountPrice, imageUrl)
  - ✅ Проверка типов данных
  - ✅ Граничные случаи (пустые строки, отрицательные цены, длинные строки)

- **`dto/query-products.dto.spec.ts`** - Тесты валидации QueryProductsDto
  - ✅ Трансформация параметров запроса
  - ✅ Валидация enum значений (sortOrder)
  - ✅ Обработка некорректных числовых значений
  - ✅ Граничные случаи (большие числа, отрицательные значения)

- **`dto/update-product.dto.spec.ts`** - Тесты валидации UpdateProductDto
  - ✅ Наследование от CreateProductDto
  - ✅ Частичные обновления
  - ✅ Валидация отдельных полей
  - ✅ Множественные ошибки валидации

#### Сервисы

- **`products.service.spec.ts`** - Тесты ProductsService
  - ✅ CRUD операции (create, findAll, findOne, update, remove)
  - ✅ Обработка ошибок (NotFoundException)
  - ✅ Пагинация и фильтрация

- **`products.repository.spec.ts`** - Тесты ProductsRepository
  - ✅ Методы работы с базой данных
  - ✅ Построение условий фильтрации
  - ✅ Пагинация и сортировка

- **`app.service.spec.ts`** - Тесты AppService
  - ✅ Метод getHello()
  - ✅ Консистентность возвращаемых значений

#### Prisma

- **`prisma/prisma.service.spec.ts`** - Тесты PrismaService
  - ✅ Подключение к базе данных
  - ✅ Методы работы с продуктами
  - ✅ Обработка событий

### Integration тесты (`/integration/`)

- **`products.controller.spec.ts`** - Базовые интеграционные тесты
  - ✅ HTTP endpoints (POST, GET, PATCH, DELETE)
  - ✅ Валидация DTO
  - ✅ Обработка ошибок

- **`products.controller.enhanced.spec.ts`** - Улучшенные интеграционные тесты
  - ✅ Детальная проверка ошибок валидации
  - ✅ Граничные случаи
  - ✅ Специальные символы в ID
  - ✅ Пустые тела запросов

### Performance тесты (`/performance/`)

- **`products.performance.spec.ts`** - Тесты производительности
  - ✅ Время выполнения CRUD операций
  - ✅ Нагрузочное тестирование
  - ✅ Обработка больших наборов данных
  - ✅ Одновременные запросы

## Запуск тестов

### Все тесты

```bash
npm test
```

### Unit тесты

```bash
npm run test:unit
```

### Integration тесты

```bash
npm run test:integration
```

### Performance тесты

```bash
npm run test:performance
```

### С покрытием

```bash
npm run test:cov
```

### В режиме watch

```bash
npm run test:watch
```

## Покрытие тестами

### ✅ Полностью покрыто:

- **ProductsService** - 100% покрытие
- **ProductsRepository** - 100% покрытие
- **ProductsController** - 100% покрытие
- **CreateProductDto** - 100% покрытие
- **QueryProductsDto** - 100% покрытие
- **UpdateProductDto** - 100% покрытие
- **AppService** - 100% покрытие
- **PrismaService** - 100% покрытие

### 🔍 Что тестируется:

#### Валидация данных

- Обязательные и необязательные поля
- Типы данных (string, number, URL)
- Граничные значения
- Некорректные данные

#### Бизнес-логика

- CRUD операции
- Пагинация
- Фильтрация и поиск
- Сортировка
- Обработка ошибок

#### API endpoints

- HTTP методы (POST, GET, PATCH, DELETE)
- Коды ответов (200, 201, 400, 404, 500)
- Валидация запросов
- Формат ответов

#### Производительность

- Время выполнения операций
- Нагрузочное тестирование
- Обработка больших данных
- Одновременные запросы

## Конфигурация тестов

### Jest конфигурация

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": ["src/**/*.(t|j)s"],
  "coverageDirectory": "coverage",
  "testEnvironment": "node"
}
```

### ValidationPipe настройки

```typescript
new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  disableErrorMessages: false,
  validationError: {
    target: false,
    value: false,
  },
});
```

## Рекомендации по разработке

1. **Добавляйте тесты для новых функций**
2. **Обновляйте тесты при изменении API**
3. **Используйте моки для изоляции тестов**
4. **Проверяйте граничные случаи**
5. **Тестируйте обработку ошибок**
6. **Измеряйте производительность**

## Отчеты о покрытии

После запуска тестов с покрытием (`npm run test:cov`) будет создан отчет в папке `coverage/`.

Откройте `coverage/lcov-report/index.html` в браузере для просмотра детального отчета о покрытии.
