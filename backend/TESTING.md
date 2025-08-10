# Тестирование backend

Этот сервис использует Jest + ts-jest для запуска unit, integration, performance и e2e тестов.

## Инструменты

- Jest 30
- ts-jest
- @nestjs/testing
- supertest (для HTTP-интеграционных и e2e тестов)

## Команды

Все команды запускаются из папки `backend`:

```bash
# все тесты
npm run test

# unit тесты
npm run test:unit

# integration тесты
npm run test:integration

# performance тесты
npm run test:performance

# DTO-тесты (частный случай unit)
npm run test:dto

# e2e тесты
npm run test:e2e

# режим watch
npm run test:watch

# покрытие
npm run test:cov

# отладка (debugger)
npm run test:debug
```

## Структура тестов

```
backend/
└── __tests__/
    ├── unit/           # модульные тесты (сервисы, репозиторий, DTO и пр.)
    ├── integration/    # интеграционные тесты HTTP-контроллеров
    └── performance/    # тесты производительности
└── test/               # e2e (см. jest-e2e.json)
```

- Unit: изолированно проверяют бизнес-логику и валидацию DTO.
- Integration: поднимают Nest-приложение в памяти и тестируют HTTP-эндпоинты через `supertest`.
- Performance: измеряют время выполнения типовых операций.
- E2E: сценарии сквозной проверки (по отдельной конфигурации `test/jest-e2e.json`).

## Конфигурация Jest

Основная конфигурация находится в `package.json` (ключ `jest`). Для e2e используется отдельный файл `test/jest-e2e.json`.

## Переменные окружения

Для unit/integration/performance тестов, как правило, реальная БД не требуется. Если сценарии предполагают подключение к БД, задайте переменные в `.env` (см. `env.example`) или мокните соответствующие зависимости.

## Покрытие

```bash
npm run test:cov
```

Отчёт появится в папке `coverage/` (откройте `coverage/lcov-report/index.html`).

## Отладка

```bash
npm run test:debug
```

Команда запускает Jest с `--runInBand` под инспектором Node.js — поставьте брейкпоинты в VS Code и подключитесь к запущенному процессу.
