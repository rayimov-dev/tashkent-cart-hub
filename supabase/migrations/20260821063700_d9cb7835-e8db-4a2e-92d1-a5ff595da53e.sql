ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Boshqa',
  ADD COLUMN IF NOT EXISTS old_price numeric,
  ADD COLUMN IF NOT EXISTS is_popular boolean NOT NULL DEFAULT false;

UPDATE public.store_settings SET delivery_fee = 15000, free_delivery_threshold = 50000 WHERE id = true;
INSERT INTO public.store_settings (id, delivery_fee, free_delivery_threshold)
  VALUES (true, 15000, 50000) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (name, description, price, old_price, category, is_popular, stock_quantity, image_url, is_active) VALUES
('Grechka 1 kg', 'Yuqori sifatli oliy nav grechka yormasi.', 22000, 28000, 'Oziq-ovqat', true, 120, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', true),
('Guruch Lazer 1 kg', 'Palov uchun ideal, tanlangan lazer guruchi.', 19000, 24000, 'Oziq-ovqat', true, 200, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', true),
('Kungaboqar yog''i 1 l', 'Tozalangan hidsiz kungaboqar yog''i.', 26000, NULL, 'Oziq-ovqat', false, 90, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80', true),
('Coca-Cola 1.5 l', 'Sovutilgan gazlangan ichimlik.', 14000, 17000, 'Ichimliklar', true, 150, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80', true),
('Tabiiy olma sharbati 1 l', 'Shakarsiz 100% olma sharbati.', 18000, NULL, 'Ichimliklar', false, 80, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80', true),
('Suv Hydrolife 5 l', 'Toza ichimlik suvi, 5 litr.', 9000, 11000, 'Ichimliklar', true, 300, 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=800&q=80', true),
('Elektr choynak 1.7 l', 'Tez qaynatuvchi po''lat elektr choynak.', 245000, 310000, 'Maishiy texnika', true, 25, 'https://images.unsplash.com/photo-1571167530149-c1105da4c2c7?w=800&q=80', true),
('Blender Sokany', '600 Vt quvvatli qo''l blenderi.', 320000, 399000, 'Maishiy texnika', false, 15, 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80', true),
('Simsiz quloqchin', 'Bluetooth 5.3, 20 soat ishlash quvvati.', 189000, 259000, 'Maishiy texnika', true, 40, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', true),
('Shampun Head&Shoulders', 'Qazg''oqqa qarshi shampun, 400 ml.', 54000, 65000, 'Go''zallik', true, 60, 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800&q=80', true),
('Yuz kremi Nivea', 'Namlantiruvchi kundalik yuz kremi.', 42000, NULL, 'Go''zallik', false, 70, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', true),
('Kir yuvish kukuni 3 kg', 'Avtomat mashinalar uchun yuvish kukuni.', 72000, 89000, 'Uy-ro''zg''or', true, 55, 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80', true),
('Idish yuvish vositasi', 'Limon hidli, 1 litr.', 21000, NULL, 'Uy-ro''zg''or', false, 100, 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&q=80', true),
('Bolalar tagligi Maxi', '4-9 kg, 44 dona.', 98000, 125000, 'Bolalar uchun', true, 45, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80', true),
('Yumshoq o''yinchoq ayiq', '40 sm, gipoallergen material.', 65000, NULL, 'Bolalar uchun', false, 35, 'https://images.unsplash.com/photo-1530325553146-c1e3d0a0e2b7?w=800&q=80', true);
