-- Скрипт инициализации базы данных для проекта TrueCode
-- Создает пользователя, базу данных и настраивает права доступа

-- Удаляем базу данных, если она существует
DROP DATABASE IF EXISTS truecode;

-- Удаляем пользователя, если он существует
DROP USER IF EXISTS truecode;

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

-- Даем права на создание баз данных (для shadow database)
ALTER USER truecode CREATEDB;

-- Даем права суперпользователя (для полного контроля)
ALTER USER truecode WITH SUPERUSER;

-- Устанавливаем пользователя truecode как владельца схемы public
ALTER SCHEMA public OWNER TO truecode; 