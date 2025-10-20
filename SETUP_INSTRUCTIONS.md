# Інструкція по налаштуванню гібридної архітектури

Ваш проект використовує:
- **Supabase** для бази даних (PostgreSQL)
- **Firebase Storage** для зберігання зображень

## Крок 1: Налаштування Supabase (Вже готово)

База даних Supabase вже налаштована та працює. Міграції знаходяться в `supabase/migrations/`.

**Важливо**: Застосуйте нову міграцію для функції промокодів:

```bash
# Якщо ви використовуєте Supabase CLI
supabase db push
```

Або застосуйте міграцію вручну через Supabase Dashboard:
1. Відкрийте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдіть у розділ SQL Editor
3. Виконайте SQL з файлу `supabase/migrations/20251020161200_add_increment_promo_code_usage_function.sql`

## Крок 2: Налаштування Firebase Storage

### 2.1 Створення Firebase проєкту

1. Відкрийте [Firebase Console](https://console.firebase.google.com/)
2. Натисніть "Add project" або "Створити проєкт"
3. Введіть назву проєкту (наприклад, "fishing-lab-storage")
4. Відключіть Google Analytics (не обов'язково)
5. Натисніть "Create project"

### 2.2 Налаштування Firebase Storage

1. У лівому меню виберіть "Storage"
2. Натисніть "Get started"
3. Виберіть "Start in production mode"
4. Виберіть регіон (рекомендується: europe-west3 (Frankfurt) для України)
5. Натисніть "Done"

### 2.3 Налаштування правил безпеки Storage

Перейдіть на вкладку "Rules" та замініть правила на наступні:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /product-images/{imageId} {
      allow read: if true;
      allow write: if true;
    }

    match /banners/{imageId} {
      allow read: if true;
      allow write: if true;
    }

    match /category-icons/{imageId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**Примітка**: Ці правила дозволяють всім користувачам читати та записувати файли. Для production середовища рекомендується додати авторизацію.

### 2.4 Отримання конфігурації Firebase

1. У лівому меню натисніть на іконку шестерні ⚙️ та виберіть "Project settings"
2. Прокрутіть вниз до розділу "Your apps"
3. Натисніть на іконку веб-додатку "</>"
4. Введіть назву додатку (наприклад, "Fishing Lab Storage")
5. Натисніть "Register app"
6. Скопіюйте значення з конфігурації Firebase

### 2.5 Налаштування змінних середовища

Відкрийте файл `.env` у корені проєкту та замініть значення:

```env
VITE_FIREBASE_API_KEY=ваш_api_key
VITE_FIREBASE_AUTH_DOMAIN=ваш_проєкт.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ваш_project_id
VITE_FIREBASE_STORAGE_BUCKET=ваш_проєкт.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=ваш_sender_id
VITE_FIREBASE_APP_ID=ваш_app_id
```

## Крок 3: Встановлення залежностей

```bash
npm install
```

## Крок 4: Запуск проєкту локально

```bash
npm run dev
```

## Крок 5: Тестування

1. Увійдіть в адмін панель
2. Спробуйте створити новий товар
3. Завантажте зображення
4. Перевірте, що зображення успішно завантажується у Firebase Storage
5. Перевірте, що інформація про товар зберігається в Supabase

## Крок 6: Деплой на Netlify

### 6.1 Налаштування змінних середовища в Netlify

1. Зайдіть у налаштування вашого сайту на Netlify
2. Перейдіть у розділ "Environment variables"
3. Додайте всі змінні з `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TELEGRAM_BOT_TOKEN`
   - `VITE_TELEGRAM_CHAT_ID`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### 6.2 Деплой

```bash
npm run build
netlify deploy --prod
```

Або запуште код на GitHub/GitLab - Netlify автоматично задеплоїть проєкт.

## Архітектура

```
┌─────────────────────────────────────────┐
│          Ваш додаток (React)            │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Supabase   │    │   Firebase   │  │
│  │   Database   │    │   Storage    │  │
│  │              │    │              │  │
│  │ - products   │    │ - images     │  │
│  │ - categories │    │ - banners    │  │
│  │ - orders     │    │ - icons      │  │
│  │ - banners    │    │              │  │
│  │ - etc.       │    │              │  │
│  └──────────────┘    └──────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## Переваги гібридної архітектури

1. **Потужна база даних**: Supabase надає PostgreSQL з повним SQL та реляційними можливостями
2. **Надійне зберігання файлів**: Firebase Storage оптимізований для зображень та медіа-файлів
3. **Масштабованість**: Обидві платформи автоматично масштабуються
4. **Безпека**: RLS політики в Supabase + Storage rules в Firebase
5. **CDN**: Автоматичний CDN для зображень через Firebase

## Вирішення проблем

### Зображення не завантажуються

1. Перевірте Firebase Storage Rules - вони повинні дозволяти запис
2. Перевірте консоль браузера на наявність помилок
3. Переконайтеся, що всі змінні Firebase в `.env` правильні
4. Перевірте, що Firebase Storage увімкнений в проєкті

### Помилки бази даних

1. Перевірте, що всі міграції застосовані в Supabase
2. Переконайтеся, що Supabase URL та ANON KEY правильні
3. Перевірте RLS політики в Supabase Dashboard

### Локальна авторизація адміністратора

Проєкт використовує localStorage для авторизації адміністратора. Для першого входу використовуйте:
- Email: `admin@example.com`
- Password: `admin123`

Або створіть нового адміністратора через Supabase Dashboard.

## Підтримка

Якщо виникають проблеми:
1. Перевірте консоль браузера
2. Перевірте Firebase Console на наявність помилок
3. Перевірте Supabase Dashboard на наявність помилок
4. Перевірте логи Netlify (якщо деплой на Netlify)
