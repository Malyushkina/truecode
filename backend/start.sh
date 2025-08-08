#!/bin/bash

echo "🚀 Запуск приложения..."

# Запускаем миграции
echo "📊 Запуск миграций..."
npx prisma migrate deploy

# Проверяем, нужно ли заполнить базу данных
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Заполнение базы данных..."
    npm run db:seed
fi

# Запускаем приложение
echo "⚡ Запуск приложения..."
npm run start:prod 