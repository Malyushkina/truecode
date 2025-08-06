#!/bin/bash

# Скрипт инициализации базы данных для проекта TrueCode
# Запускает PostgreSQL и создает пользователя с базой данных

echo "🚀 Инициализация базы данных TrueCode..."

# Проверяем, запущен ли PostgreSQL
if ! docker ps | grep -q "truecode_postgres"; then
    echo "📦 Запускаем PostgreSQL..."
    docker-compose up postgres -d
    sleep 5  # Ждем запуска контейнера
fi

echo "🔧 Создаем пользователя и базу данных..."

# Выполняем SQL скрипт инициализации
docker exec -i truecode_postgres psql -U postgres < init-db.sql

if [ $? -eq 0 ]; then
    echo "✅ База данных успешно инициализирована!"
    echo "📊 Проверяем подключение..."
    
    # Проверяем подключение к базе данных
    docker exec -it truecode_postgres psql -U truecode -d truecode -c "\dt"
    
    echo "🎉 База данных готова к использованию!"
    echo "📝 Параметры подключения:"
    echo "   - Хост: localhost"
    echo "   - Порт: 5433"
    echo "   - База данных: truecode"
    echo "   - Пользователь: truecode"
    echo "   - Пароль: truecode"
else
    echo "❌ Ошибка при инициализации базы данных"
    exit 1
fi 