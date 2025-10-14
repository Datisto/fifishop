/*
  # Додати початкові категорії та товари
  
  1. Нові дані
    - Додаємо 12 категорій для риболовлі
    - Додаємо 12 товарів з описами та цінами
  
  2. Примітки
    - Всі товари мають статус опублікованих
    - Використовуються реальні зображення з Pexels
*/

-- Додаємо категорії
INSERT INTO categories (name, slug, description, is_published, sort_order, seo_title, seo_description) VALUES
  ('Топові продажі', 'topovi-prodazhi', 'Найпопулярніші товари для риболовлі', true, 1, 'Топові продажі - Найкращі товари для риболовлі', 'Найпопулярніші та найбільш продавані товари для риболовлі. Преміум якість за найкращими цінами.'),
  ('Вудки для нахлисту', 'vudky-dlia-nakhlystu', 'Професійні вудки для нахлистової риболовлі', true, 2, 'Вудки для нахлисту - Професійне спорядження', 'Високоякісні вудки для нахлистової риболовлі. Ідеально для професіоналів та любителів.'),
  ('Риболовні човни', 'rybolovni-chovny', 'Човни та каяки для риболовлі', true, 3, 'Риболовні човни - Комфортна риболовля', 'Надійні риболовні човни та каяки. Комфорт та безпека на воді.'),
  ('Аксесуари', 'aksesuary', 'Додаткове приладдя для риболовлі', true, 4, 'Риболовні аксесуари - Все необхідне', 'Широкий вибір аксесуарів для комфортної риболовлі.'),
  ('Снасті та спорядження', 'snasti-ta-sporiadzhennia', 'Повний набір снастей для риболовлі', true, 5, 'Снасті та спорядження - Все для риболовлі', 'Якісні снасті та спорядження для успішної риболовлі.'),
  ('Спінінгові котушки', 'spininovi-kotushky', 'Котушки для спінінгової риболовлі', true, 6, 'Спінінгові котушки - Плавна робота', 'Преміум спінінгові котушки з вдосконаленою системою гальмування.'),
  ('Риболовні волосіні', 'rybolovni-volosini', 'Міцні волосіні для риболовлі', true, 7, 'Риболовні волосіні - Ультраміцні', 'Високоякісні плетені та монофільні волосіні.'),
  ('Приманки та наживка', 'prymanky-ta-nazhyvka', 'Різноманітні приманки для риболовлі', true, 8, 'Приманки та наживка - Великий вибір', 'Ефективні приманки для прісноводної та морської риболовлі.'),
  ('Риболовні жилети', 'rybolovni-zhylety', 'Зручні жилети для риболовлі', true, 9, 'Риболовні жилети - Комфорт та функціональність', 'Жилети з багатьма кишенями та чудовою вентиляцією.'),
  ('Коробки для приманок', 'korobky-dlia-prymanok', 'Зберігання для риболовного приладдя', true, 10, 'Коробки для приманок - Організоване зберігання', 'Зручні коробки для зберігання всього риболовного приладдя.'),
  ('Риболовні сітки', 'rybolovni-sitky', 'Міцні сітки для вилову риби', true, 11, 'Риболовні сітки - Надійний вилов', 'Професійні сітки для безпечного вилову риби.'),
  ('Вейдерси', 'veydersy', 'Водонепроникні вейдерси для риболовлі', true, 12, 'Вейдерси - Комфорт у воді', 'Якісні вейдерси для комфортної риболовлі у воді.')
ON CONFLICT (slug) DO NOTHING;

-- Отримуємо ID категорій для використання
DO $$
DECLARE
  cat_fly_rods uuid;
  cat_reels uuid;
  cat_boxes uuid;
  cat_lines uuid;
  cat_lures uuid;
  cat_vests uuid;
  cat_boats uuid;
  cat_accessories uuid;
  cat_tackle uuid;
  cat_nets uuid;
  cat_waders uuid;
BEGIN
  SELECT id INTO cat_fly_rods FROM categories WHERE slug = 'vudky-dlia-nakhlystu';
  SELECT id INTO cat_reels FROM categories WHERE slug = 'spininovi-kotushky';
  SELECT id INTO cat_boxes FROM categories WHERE slug = 'korobky-dlia-prymanok';
  SELECT id INTO cat_lines FROM categories WHERE slug = 'rybolovni-volosini';
  SELECT id INTO cat_lures FROM categories WHERE slug = 'prymanky-ta-nazhyvka';
  SELECT id INTO cat_vests FROM categories WHERE slug = 'rybolovni-zhylety';
  SELECT id INTO cat_boats FROM categories WHERE slug = 'rybolovni-chovny';
  SELECT id INTO cat_accessories FROM categories WHERE slug = 'aksesuary';
  SELECT id INTO cat_tackle FROM categories WHERE slug = 'snasti-ta-sporiadzhennia';
  SELECT id INTO cat_nets FROM categories WHERE slug = 'rybolovni-sitky';
  SELECT id INTO cat_waders FROM categories WHERE slug = 'veydersy';

  -- Додаємо товари
  INSERT INTO products (name, slug, sku, description, full_description, price, stock_quantity, is_published, main_image_url, brand, seo_title, seo_description) VALUES
    ('Професійна Риболовна Вудка', 'profesiyna-rybolovna-vudka', 'PRV001', 'Високопродуктивна вудка з вуглецевого волокна з виключною чутливістю', 'Професійна риболовна вудка виготовлена з високоякісного вуглецевого волокна. Забезпечує виключну чутливість та міцність. Ідеально підходить для досвідчених рибалок. Легка конструкція дозволяє проводити тривалі сесії без втоми. Довжина: 2.7м, тест: 10-30г.', 5999, 15, true, 'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=800', 'FishPro', 'Професійна Риболовна Вудка - Вуглецеве волокно', 'Високопродуктивна професійна вудка з вуглецевого волокна з виключною чутливістю. Преміум якість для досвідчених рибалок.'),
    ('Преміум Спінінгова Котушка', 'premium-spiningova-kotushka', 'PSK002', 'Плавна робота з вдосконаленою системою гальмування', 'Преміум спінінгова котушка з передовою системою гальмування. 10 підшипників для ідеально плавної роботи. Алюмінієва шпуля забезпечує довговічність. Співвідношення передачі 5.2:1. Ідеально підходить як для прісноводної, так і для морської риболовлі.', 3599, 25, true, 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800', 'ReelMaster', 'Преміум Спінінгова Котушка - Плавна робота', 'Професійна спінінгова котушка з 10 підшипниками та вдосконаленою системою гальмування для ідеальної риболовлі.'),
    ('Коробка для Приманок Делюкс', 'korobka-dlia-prymanok-delux', 'KPD003', 'Організоване зберігання для всіх риболовних потреб', 'Делюкс коробка для приманок з 24 регульованими відділеннями. Водонепроникна конструкція захищає ваше приладдя. Міцний пластик витримує важкі умови експлуатації. Компактний розмір зручний для транспортування. Розміри: 28x18x5 см.', 1849, 40, true, 'https://images.pexels.com/photos/7657988/pexels-photo-7657988.jpeg?auto=compress&cs=tinysrgb&w=800', 'TackleBox Pro', 'Коробка для Приманок Делюкс - Організоване зберігання', 'Професійна коробка для приманок з 24 відділеннями. Водонепроникна та надійна для зберігання вашого приладдя.'),
    ('Плетена Волосінь', 'pletena-volosin', 'PV004', 'Ультраміцна волосінь 30 фунтів для великого улову', 'Ультраміцна плетена волосінь 30lb (13.6кг). 8-ниткове плетення для максимальної міцності. Низький коефіцієнт розтягування для кращої чутливості. Стійкість до зносу та довговічність. Довжина: 300 метрів. Підходить для різних видів риболовлі.', 999, 60, true, 'https://images.pexels.com/photos/932638/pexels-photo-932638.jpeg?auto=compress&cs=tinysrgb&w=800', 'LinePro', 'Плетена Волосінь 30lb - Ультраміцна', 'Професійна плетена волосінь 30lb з 8-нитковим плетенням. Ідеальна для великого улову та різних видів риболовлі.'),
    ('Набір Приманок', 'nabir-prymanok', 'NP005', 'Асортимент приманок для прісноводної та морської риболовлі', 'Універсальний набір приманок з 50 елементів. Включає воблери, силіконові приманки, блешні та джиг-головки. Підходить для різних видів риби та умов ловлі. Якісні матеріали та реалістична забарвлення. Зручна коробка для зберігання в комплекті.', 1399, 35, true, 'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=800', 'LureMaster', 'Набір Приманок 50 шт - Універсальний комплект', 'Професійний набір з 50 приманок для прісноводної та морської риболовлі. Воблери, силікон, блешні в одному наборі.'),
    ('Риболовний Жилет Про', 'rybolovnyi-zhylet-pro', 'RZP006', 'Зручний жилет з багатьма кишенями та вентиляцією', 'Професійний риболовний жилет з 12 кишенями різного розміру. Дихаючий матеріал забезпечує комфорт у спеку. Регульовані ремені для ідеальної посадки. Спеціальні кріплення для інструментів. Водовідштовхувальне покриття. Розміри: M, L, XL.', 3199, 20, true, 'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?auto=compress&cs=tinysrgb&w=800', 'FishGear Pro', 'Риболовний Жилет Про - Комфорт та функціональність', 'Професійний жилет з 12 кишенями та вентиляцією. Ідеальний для тривалих риболовних сесій у будь-яку погоду.'),
    ('Вудка з Вуглецевого Волокна', 'vudka-z-vuhletsevoho-volokna', 'VVV007', 'Легка та міцна для тривалих сесій закидання', 'Ультралегка вудка з високомодульного вуглецевого волокна. Вага всього 120г для комфортної роботи весь день. Швидкий стрій для точного закидання. Міцна конструкція витримує великі навантаження. Довжина: 2.4м, тест: 5-25г. Включає тубус для зберігання.', 5199, 12, true, 'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=800', 'CarbonPro', 'Вудка з Вуглецевого Волокна - Легка та міцна', 'Ультралегка вудка (120г) з високомодульного карбону. Швидкий стрій для точного закидання на великі відстані.'),
    ('Аксесуари для Риболовного Човна', 'aksesuary-dlia-rybolovnoho-chovnu', 'ARC008', 'Повний набір для вашого риболовного човна', 'Комплексний набір аксесуарів для риболовного човна. Включає тримачі для вудок, ящики для зберігання, якірну систему та кріплення для ехолота. Всі елементи виготовлені з нержавіючих матеріалів. Легке встановлення без спеціальних інструментів. Підходить для більшості човнів.', 11999, 8, true, 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800', 'BoatPro', 'Аксесуари для Риболовного Човна - Повний комплект', 'Професійний набір аксесуарів для човна: тримачі вудок, ящики, якір, кріплення ехолота. Нержавіючі матеріали.'),
    ('Набір Гачків', 'nabir-hachkiv', 'NH009', 'Різні розміри для різних потреб риболовлі', 'Професійний набір гачків з 200 елементів. Розміри від №2 до №12 для різних видів риби. Високовуглецева сталь для максимальної міцності. Хімічно загострені жала для кращого зачеплення. Організовані в зручній коробці з підписаними відділеннями.', 799, 50, true, 'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=800', 'HookMaster', 'Набір Гачків 200 шт - Різні розміри', 'Професійний набір з 200 гачків від №2 до №12. Високовуглецева сталь, хімічно загострені жала.'),
    ('Сумка для Спорядження', 'sumka-dlia-sporiadzhennia', 'SS010', 'Міцна сумка з багатьма відділеннями', 'Велика сумка для риболовного спорядження об`ємом 60л. Водонепроникний матеріал Oxford 600D. 8 зовнішніх кишень для аксесуарів. Посилене дно для стійкості. Зручні регульовані лямки. Розміри: 55x30x30 см. Ідеальна для триденних поїздок.', 2199, 30, true, 'https://images.pexels.com/photos/932638/pexels-photo-932638.jpeg?auto=compress&cs=tinysrgb&w=800', 'GearBag Pro', 'Сумка для Спорядження 60л - Міцна та місткісна', 'Професійна сумка 60л з водонепроникного Oxford 600D. 8 кишень, посилене дно, зручні лямки.'),
    ('Риболовна Сітка Про', 'rybolovna-sitka-pro', 'RSP011', 'Міцна сітка для вилову великого улову', 'Професійна риболовна сітка з алюмінієвою рамою. Діаметр обруча 60см для великої риби. М`яка безвузлова сітка не пошкоджує рибу. Телескопічна ручка розкладається до 2 метрів. Гумове покриття на ручці для надійного хвату. Вага всього 800г.', 1599, 18, true, 'https://images.pexels.com/photos/3689772/pexels-photo-3689772.jpeg?auto=compress&cs=tinysrgb&w=800', 'NetPro', 'Риболовна Сітка Про - Для великого улову', 'Професійна сітка з алюмінієвою рамою 60см. М`яка безвузлова сітка, телескопічна ручка 2м, вага 800г.'),
    ('Вейдерси Делюкс', 'veydersy-delux', 'VD012', 'Водонепроникні вейдерси для комфорту на весь день', 'Преміум вейдерси з дихаючої мембрани Gore-Tex. Повністю водонепроникні та вітрозахисні. Вбудовані неопренові чоботи для тепла. Регульовані лямки та пояс. Посилені коліна для довговічності. Розміри: M, L, XL, XXL. Ідеальні для ловлі взаброд.', 6399, 10, true, 'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?auto=compress&cs=tinysrgb&w=800', 'WaderPro', 'Вейдерси Делюкс Gore-Tex - Комфорт на весь день', 'Преміум вейдерси з Gore-Tex мембраною. Водонепроникні, дихаючі, з неопреновими чоботами та посиленими колінами.')
  ON CONFLICT (sku) DO NOTHING;

  -- Зв'язуємо товари з категоріями
  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, cat_fly_rods FROM products p WHERE p.sku IN ('PRV001', 'VVV007')
  ON CONFLICT DO NOTHING;

  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, cat_reels FROM products p WHERE p.sku = 'PSK002'
  ON CONFLICT DO NOTHING;

  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, cat_boxes FROM products p WHERE p.sku = 'KPD003'
  ON CONFLICT DO NOTHING;

  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, cat_lines FROM products p WHERE p.sku = 'PV004'
  ON CONFLICT DO NOTHING;

  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, cat_lures FROM products p WHERE p.sku = 'NP005'
  ON CONFLICT DO NOTHING;

  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, cat_vests FROM products p WHERE p.sku IN ('RZP006', 'VD012')
  ON CONFLICT DO NOTHING;

  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, cat_boats FROM products p WHERE p.sku = 'ARC008'
  ON CONFLICT DO NOTHING;

  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, cat_accessories FROM products p WHERE p.sku = 'NH009'
  ON CONFLICT DO NOTHING;

  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, cat_tackle FROM products p WHERE p.sku = 'SS010'
  ON CONFLICT DO NOTHING;

  INSERT INTO product_categories (product_id, category_id)
  SELECT p.id, cat_nets FROM products p WHERE p.sku = 'RSP011'
  ON CONFLICT DO NOTHING;

END $$;
