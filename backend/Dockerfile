# Backend Dockerfile (Node 21)
FROM node:21-alpine

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Копируем Prisma схему для генерации клиента
COPY prisma ./prisma
RUN npx prisma generate

# Экспонируем порт приложения
EXPOSE 3000

# Команда по умолчанию: dev-режим с горячей перезагрузкой
CMD ["npm", "run", "start:dev"] 