# 🚀 Руководство по развертыванию TrueCode

Это руководство поможет вам развернуть проект TrueCode на GitHub с использованием бесплатных облачных сервисов.

## 📋 План развертывания

### 1. Backend (Railway)

- **Сервис**: Railway (бесплатный тир)
- **База данных**: PostgreSQL на Railway
- **Файловое хранилище**: Cloudinary (бесплатный тир)

### 2. Frontend (Vercel)

- **Сервис**: Vercel (бесплатный тир)
- **Домен**: `your-project.vercel.app`

## 🔧 Подготовка к развертыванию

### Шаг 1: Подготовка GitHub репозитория

1. Создайте новый репозиторий на GitHub
2. Загрузите код в репозиторий:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/truecode.git
git push -u origin main
```

### Шаг 2: Настройка Railway (Backend + Database)

1. **Зарегистрируйтесь на Railway**: https://railway.app
2. **Создайте новый проект**:

   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Выберите ваш репозиторий
   - Выберите папку `backend`

3. **Добавьте PostgreSQL базу данных**:

   - В проекте нажмите "New"
   - Выберите "Database" → "PostgreSQL"
   - Railway автоматически создаст переменную `DATABASE_URL`

4. **Настройте переменные окружения**:

   ```
   NODE_ENV=production
   PORT=3000
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

5. **Запустите миграции**:
   - В настройках проекта добавьте команду:
   ```
   npx prisma migrate deploy
   ```

### Шаг 3: Настройка Cloudinary (Файловое хранилище)

1. **Зарегистрируйтесь на Cloudinary**: https://cloudinary.com
2. **Получите учетные данные**:
   - Cloud Name
   - API Key
   - API Secret
3. **Добавьте их в переменные окружения Railway**

### Шаг 4: Настройка Vercel (Frontend)

1. **Зарегистрируйтесь на Vercel**: https://vercel.com
2. **Импортируйте проект**:

   - Нажмите "New Project"
   - Подключите GitHub репозиторий
   - Выберите папку `frontend`
   - Framework: Next.js

3. **Настройте переменные окружения**:

   ```
   NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
   ```

4. **Деплой**:
   - Vercel автоматически соберет и развернет приложение
   - Получите URL вида: `https://your-project.vercel.app`

### Шаг 5: Обновление CORS настроек

После получения URL frontend, обновите переменную `ALLOWED_ORIGINS` в Railway:

```
ALLOWED_ORIGINS=https://your-project.vercel.app
```

## 🔄 Обновление кода

### Автоматическое развертывание

После настройки:

- **Frontend**: Автоматически обновляется при push в main ветку
- **Backend**: Автоматически обновляется при push в main ветку

### Ручное обновление

```bash
# Обновление кода
git add .
git commit -m "Update code"
git push origin main
```

## 📊 Мониторинг

### Railway

- Логи: Dashboard → Ваш сервис → Logs
- Метрики: Dashboard → Ваш сервис → Metrics

### Vercel

- Логи: Dashboard → Ваш проект → Functions
- Аналитика: Dashboard → Ваш проект → Analytics

## 🛠️ Альтернативные варианты

### Если Railway недоступен:

- **Render**: https://render.com
- **Heroku**: https://heroku.com (есть бесплатный тир)

### Если Vercel недоступен:

- **Netlify**: https://netlify.com
- **GitHub Pages**: Для статических сайтов

## 🔧 Локальная разработка

Для локальной разработки используйте Docker Compose:

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка
docker-compose down
```

## 📝 Полезные команды

```bash
# Проверка статуса Railway
railway status

# Локальный запуск Railway
railway login
railway link
railway up

# Проверка Vercel
vercel --version
vercel login
vercel --prod
```

## 🆘 Устранение неполадок

### Backend не запускается:

1. Проверьте логи в Railway
2. Убедитесь, что все переменные окружения настроены
3. Проверьте подключение к базе данных

### Frontend не подключается к Backend:

1. Проверьте CORS настройки
2. Убедитесь, что URL API правильный
3. Проверьте, что backend доступен

### База данных не работает:

1. Проверьте переменную `DATABASE_URL`
2. Запустите миграции: `npx prisma migrate deploy`
3. Проверьте подключение к базе данных

## 📞 Поддержка

- **Railway**: https://docs.railway.app
- **Vercel**: https://vercel.com/docs
- **Cloudinary**: https://cloudinary.com/documentation

---

🎉 **Поздравляем!** Ваше приложение теперь доступно в интернете!
