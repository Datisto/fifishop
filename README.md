# Інтернет-магазин Fishing Lab

Повнофункціональний інтернет-магазин на React + TypeScript з адмін-панеллю.

## Технології

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Storage + Edge Functions)
- **Роутинг**: React Router v7
- **UI компоненти**: Lucide React icons
- **Drag & Drop**: @dnd-kit

## Архітектура

Проект використовує **100% Supabase**:
- ✅ База даних: Supabase PostgreSQL
- ✅ Зберігання файлів: Supabase Storage
- ✅ Serverless функції: Supabase Edge Functions
- ✅ Авторизація: Supabase Auth

## Особливості

### Функціонал для клієнтів:
- Каталог товарів з пошуком та фільтрами
- Детальні сторінки товарів
- Кошик з можливістю застосування промокодів
- Оформлення замовлення
- Інтеграція з Telegram для сповіщень

### Адмін-панель:
- Управління товарами (CRUD)
- Управління категоріями (CRUD)
- Управління банерами (CRUD)
- Система промокодів з різними типами знижок
- Перегляд та обробка замовлень
- Логування дій адміністратора

### Система промокодів:
- Фіксована знижка
- Відсоткова знижка
- Подарунковий товар
- Безкоштовна доставка
- Обмеження використання
- Обмеження по категоріях
- Захист від зловживань (rate limiting)

## Встановлення та запуск

### 1. Клонування репозиторію

```bash
git clone <repository-url>
cd fishing-lab
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Налаштування змінних середовища

Створіть файл `.env` з такими змінними:

```env
VITE_SUPABASE_URL=ваш_supabase_url
VITE_SUPABASE_ANON_KEY=ваш_supabase_anon_key
VITE_TELEGRAM_BOT_TOKEN=ваш_telegram_bot_token
VITE_TELEGRAM_CHAT_ID=ваш_telegram_chat_id
```

### 4. Налаштування Supabase

1. Створіть проект на [Supabase](https://supabase.com)
2. Застосуйте міграції з папки `supabase/migrations/`
3. Налаштуйте Storage bucket `product-images` з публічним доступом
4. Деплойте Edge Function `send-telegram-notification`

### 5. Запуск проєкту

```bash
# Режим розробки
npm run dev

# Збірка для продакшену
npm run build

# Перегляд збірки
npm run preview
```

## Структура проєкту

```
fishing-lab/
├── src/
│   ├── components/        # React компоненти
│   ├── pages/            # Сторінки додатку
│   │   └── admin/        # Адмін-панель
│   ├── lib/              # Бізнес-логіка та API
│   │   ├── supabase.ts   # Supabase клієнт
│   │   ├── products.ts   # API товарів
│   │   ├── categories.ts # API категорій
│   │   ├── banners.ts    # API банерів
│   │   ├── promoCodes.ts # API промокодів
│   │   └── orders.ts     # API замовлень
│   └── contexts/         # React контексти
├── supabase/
│   ├── migrations/       # SQL міграції
│   └── functions/        # Edge Functions
└── public/               # Статичні файли
```

## База даних

### Основні таблиці:

- `products` - товари
- `product_images` - зображення товарів
- `categories` - категорії товарів
- `product_categories` - зв'язок товарів і категорій
- `banners` - рекламні банери
- `promo_codes` - промокоди
- `promo_code_usage` - використання промокодів
- `promo_code_attempts` - спроби використання промокодів
- `orders` - замовлення
- `order_items` - товари в замовленнях
- `order_promo_codes` - промокоди в замовленнях

### RLS (Row Level Security)

Всі таблиці захищені RLS політиками:
- Публічний доступ для читання
- Анонімний доступ для створення замовлень
- Доступ адміністраторів для управління

## Деплоймент

### Netlify

1. Підключіть репозиторій до Netlify
2. Додайте змінні середовища в Netlify Dashboard
3. Налаштуйте build команду: `npm run build`
4. Налаштуйте publish directory: `dist`

### Vercel

```bash
npm run build
vercel --prod
```

## Вирішення проблем

### Зображення не завантажуються

1. Перевірте, що Supabase Storage bucket існує та має публічний доступ
2. Перевірте RLS політики для storage.objects
3. Перевірте консоль браузера на помилки

### Проблеми з базою даних

1. Переконайтеся, що всі міграції застосовані
2. Перевірте RLS політики в Supabase Dashboard
3. Перевірте, що VITE_SUPABASE_URL та VITE_SUPABASE_ANON_KEY правильні

### Telegram сповіщення не працюють

1. Перевірте, що Edge Function `send-telegram-notification` деплоєна
2. Перевірте токен бота та chat ID
3. Перегляньте логи Edge Function в Supabase Dashboard

## Ліцензія

MIT

## Автори

Fishing Lab Team
