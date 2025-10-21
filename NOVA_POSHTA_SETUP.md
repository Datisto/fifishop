# Інструкція з налаштування інтеграції Нової Пошти

## Крок 1: Отримання API ключа Нової Пошти

1. Зареєструйтесь або увійдіть на сайті [Нової Пошти](https://new-poshta.ua/)
2. Перейдіть в особистий кабінет
3. Знайдіть розділ "Налаштування" → "Безпека" → "API ключі"
4. Створіть новий API ключ або скопіюйте існуючий

## Крок 2: Додайте API ключ до проекту

Додайте ваш API ключ до файлу `.env`:

```env
VITE_NOVA_POSHTA_API_KEY=ваш_api_ключ_тут
```

## Крок 3: Синхронізація даних

### Синхронізація міст (потрібно виконати один раз):

Викличіть Edge Function для синхронізації міст:

```bash
curl -X POST https://vlhzohyceobebgatshyi.supabase.co/functions/v1/sync-nova-poshta-cities \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Або через браузер, відкрийте:
```
https://vlhzohyceobebgatshyi.supabase.co/functions/v1/sync-nova-poshta-cities
```

### Синхронізація відділень (потрібно виконати один раз):

Викличіть Edge Function для синхронізації відділень:

```bash
curl -X POST https://vlhzohyceobebgatshyi.supabase.co/functions/v1/sync-nova-poshta-warehouses \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Або через браузер, відкрийте:
```
https://vlhzohyceobebgatshyi.supabase.co/functions/v1/sync-nova-poshta-warehouses
```

**Примітка:** Синхронізація може зайняти кілька хвилин, оскільки в Україні тисячі відділень Нової Пошти.

## Крок 4: Налаштування автоматичного оновлення (опціонально)

Для автоматичного щоденного оновлення даних, ви можете налаштувати cron-завдання або використовувати сервіси типу:

- GitHub Actions
- Cron-job.org
- EasyCron

Приклад для щоденного оновлення о 3:00 ранку:

```yaml
# .github/workflows/sync-nova-poshta.yml
name: Sync Nova Poshta Data

on:
  schedule:
    - cron: '0 3 * * *'  # Щодня о 3:00 UTC

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync Cities
        run: |
          curl -X POST https://vlhzohyceobebgatshyi.supabase.co/functions/v1/sync-nova-poshta-cities \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"

      - name: Sync Warehouses
        run: |
          curl -X POST https://vlhzohyceobebgatshyi.supabase.co/functions/v1/sync-nova-poshta-warehouses \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

## Використання

Після налаштування, інтеграція Нової Пошти буде доступна на сторінці оформлення замовлення (`/checkout`):

1. Клієнти зможуть обрати тип доставки: "Нова Пошта" або "Інша адреса"
2. При виборі "Нова Пошта":
   - Автозаповнення для пошуку міста
   - Вибір відділення з повним списком
   - Відображення робочого графіку відділення
3. Дані доставки будуть збережені в замовленні та надіслані в Telegram

## Особливості

- **Автозаповнення міст:** Пошук починається після введення 2+ символів з затримкою 300мс
- **Фільтрація відділень:** Можна шукати за номером або адресою
- **Кешування:** Дані зберігаються локально в Supabase для швидкого доступу
- **Оновлення:** Рекомендується оновлювати дані 1 раз на день або тиждень

## Підтримка

Якщо виникли проблеми:
1. Переконайтеся, що API ключ Нової Пошти правильний
2. Перевірте, що виконано синхронізацію міст та відділень
3. Перегляньте логи Edge Functions в Supabase Dashboard
