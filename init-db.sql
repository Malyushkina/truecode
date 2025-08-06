-- Скрипт инициализации базы данных для проекта TrueCode
-- Создает пользователя, базу данных и настраивает права доступа

-- Создаем пользователя truecode с паролем
CREATE USER truecode WITH PASSWORD 'truecode';

-- Создаем базу данных truecode с владельцем truecode
CREATE DATABASE truecode OWNER truecode;

-- Предоставляем все права на базу данных пользователю truecode
GRANT ALL PRIVILEGES ON DATABASE truecode TO truecode;

-- Подключаемся к базе данных truecode
\c truecode;

-- Предоставляем права на схему public
GRANT ALL ON SCHEMA public TO truecode;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO truecode;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO truecode;

-- Устанавливаем права по умолчанию для будущих таблиц
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO truecode;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO truecode; 