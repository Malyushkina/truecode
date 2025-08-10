# --- BUILDER STAGE ---
FROM node:22-alpine AS builder

ENV NPM_CONFIG_UPDATE_NOTIFIER=false
WORKDIR /app

# Устанавливаем зависимости (dev+prod)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Копируем исходный код
COPY . .

# Генерируем Prisma клиент и собираем приложение
RUN rm -rf dist && npx prisma generate
RUN npm run build

# Удаляем dev-зависимости, оставляя только production
RUN npm prune --omit=dev

# --- PRODUCTION STAGE ---
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
WORKDIR /app

# Копируем только необходимые файлы из билдера
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Проверяем содержимое dist
RUN ls -la dist/

# Снижаем привилегии до non-root пользователя
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

EXPOSE 3000

# Команда по умолчанию: применяем миграции и запускаем сервер
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && if [ \"$SEED_DATABASE\" = \"true\" ]; then node prisma/seed.js; fi && node dist/src/main"] 