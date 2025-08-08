# --- BUILDER STAGE ---
FROM node:22-alpine AS builder

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Копируем исходный код
COPY . .

# Генерируем Prisma клиент и собираем приложение
RUN npx prisma generate
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:22-alpine

WORKDIR /app

# Копируем package.json и устанавливаем ВСЕ зависимости (нужны для seed)
COPY --from=builder /app/package*.json ./
RUN npm ci --no-audit --no-fund

# Копируем скомпилированный код и необходимые файлы
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Экспонируем порт приложения
EXPOSE 3000

# Команда по умолчанию: production режим с возможностью seed
CMD ["sh", "-c", "npx prisma migrate deploy && if [ \"$SEED_DATABASE\" = \"true\" ]; then npm run db:seed; fi && node dist/main"] 