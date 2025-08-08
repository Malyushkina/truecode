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

# Копируем package.json и устанавливаем ВСЕ зависимости
COPY --from=builder /app/package*.json ./
RUN npm ci --no-audit --no-fund

# Копируем скомпилированный код и ВСЕ необходимые файлы
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/start.sh ./

# Делаем скрипт исполняемым
RUN chmod +x start.sh

# Экспонируем порт приложения
EXPOSE 3000

# Команда по умолчанию: production режим с возможностью seed
CMD ["sh", "-c", "npx prisma migrate deploy && if [ \"$SEED_DATABASE\" = \"true\" ]; then npm run db:seed; fi && npm run start:prod"] 