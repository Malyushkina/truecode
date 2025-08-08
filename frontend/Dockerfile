# Frontend Dockerfile (Node 21)
FROM node:21-alpine

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Экспонируем порт Next.js
EXPOSE 3000

# Команда по умолчанию: dev-режим
CMD ["npm", "run", "dev"] 