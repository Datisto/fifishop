# Налаштування Firebase для проєкту

Ваш проєкт мігровано з Supabase на Firebase Firestore. Щоб запустити проєкт, виконайте наступні кроки:

## 1. Створення Firebase проєкту

1. Відкрийте [Firebase Console](https://console.firebase.google.com/)
2. Натисніть "Add project" або "Створити проєкт"
3. Введіть назву проєкту (наприклад, "fishing-lab")
4. Відключіть Google Analytics (не обов'язково для цього проєкту)
5. Натисніть "Create project"

## 2. Налаштування Firestore Database

1. У лівому меню виберіть "Firestore Database"
2. Натисніть "Create database"
3. Виберіть режим "Start in production mode"
4. Виберіть регіон (рекомендується: europe-west3 (Frankfurt) для України)
5. Натисніть "Enable"

## 3. Налаштування правил безпеки Firestore

У розділі "Rules" замініть правила на наступні:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Публічний доступ для читання товарів та категорій
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }

    match /product_images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }

    match /product_categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }

    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }

    match /banners/{bannerId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }

    match /promo_codes/{promoId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }

    // Замовлення можуть створювати всі
    match /orders/{orderId} {
      allow read: if request.auth != null && get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
      allow create: if true;
      allow update: if request.auth != null && get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }

    match /order_items/{itemId} {
      allow read: if request.auth != null && get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
      allow create: if true;
    }

    // Профілі користувачів
    match /user_profiles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Логи адміністратора
    match /admin_logs/{logId} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }

    match /login_attempts/{attemptId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 4. Налаштування Authentication

1. У лівому меню виберіть "Authentication"
2. Натисніть "Get started"
3. Виберіть "Email/Password" як метод входу
4. Увімкніть "Email/Password"
5. Натисніть "Save"

## 5. Створення адміністратора

1. У розділі "Authentication" перейдіть на вкладку "Users"
2. Натисніть "Add user"
3. Введіть email адміністратора (наприклад, admin@fishinglab.com)
4. Введіть пароль
5. Натисніть "Add user"
6. Скопіюйте User UID (ідентифікатор користувача)

7. Перейдіть у Firestore Database
8. Створіть колекцію "user_profiles"
9. Створіть документ з ID = User UID
10. Додайте поля:
    - role: "admin" (string)
    - created_at: (timestamp, поточна дата)
    - updated_at: (timestamp, поточна дата)

## 6. Налаштування Storage (для зображень)

1. У лівому меню виберіть "Storage"
2. Натисніть "Get started"
3. Виберіть "Start in production mode"
4. Виберіть той самий регіон, що і для Firestore
5. Натисніть "Done"

6. Перейдіть на вкладку "Rules" та замініть на:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /product-images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /banners/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 7. Отримання конфігурації Firebase

1. У лівому меню натисніть на іконку шестерні ⚙️ та виберіть "Project settings"
2. Прокрутіть вниз до розділу "Your apps"
3. Натисніть на іконку веб-додатку "</>"
4. Введіть назву додатку (наприклад, "Fishing Lab Web")
5. Натисніть "Register app"
6. Скопіюйте конфігурацію Firebase (firebaseConfig)

## 8. Налаштування змінних середовища

1. Відкрийте файл `.env.local` у корені проєкту
2. Замініть значення з конфігурації Firebase:

```env
VITE_FIREBASE_API_KEY=ваш_api_key
VITE_FIREBASE_AUTH_DOMAIN=ваш_проєкт.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ваш_project_id
VITE_FIREBASE_STORAGE_BUCKET=ваш_проєкт.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=ваш_sender_id
VITE_FIREBASE_APP_ID=ваш_app_id
```

## 9. Налаштування для Netlify

1. Зайдіть у налаштування вашого сайту на Netlify
2. Перейдіть у розділ "Environment variables"
3. Додайте всі змінні з `.env.local`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

## 10. Запуск проєкту локально

```bash
npm install
npm run dev
```

## 11. Деплой на Netlify

1. Переконайтеся, що всі змінні середовища додані в Netlify
2. Запушіть код на GitHub/GitLab
3. Netlify автоматично задеплоїть проєкт

Або використайте Netlify CLI:

```bash
npm run build
netlify deploy --prod
```

## Важливі примітки

- Конфігурація Firebase (API ключі) можуть бути публічними - вони захищені правилами безпеки Firestore
- Переконайтеся, що правила безпеки Firestore правильно налаштовані
- Для production використання рекомендується увімкнути App Check для додаткового захисту

## Підтримка

Якщо виникають проблеми:
1. Перевірте правила безпеки у Firestore та Storage
2. Перевірте налаштування змінних середовища
3. Перевірте консоль браузера на наявність помилок
4. Перевірте логи Firebase Console у розділі "Functions" та "Firestore"
