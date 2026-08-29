# **Oson Savdo**

Do'kon uchun onlayn buyurtma ilovasi (e-commerce web app) yarat. Talablar:

1. Ikki xil foydalanuvchi turi, alohida login/parol bilan kirish:
   - Mijozlar (customers) — ro'yxatdan o'tadi va o'z akkaunti bilan kiradi
   - Adminlar (admins) — alohida admin panelga login/parol bilan kiradi (mijozlar admin panelga kira olmasin)

2. Mijozlar uchun funksiyalar:
   - Mahsulotlar katalogini ko'rish (rasm, nomi, narxi, tavsifi)
   - Savatga qo'shish va buyurtma berish
   - Yetkazib berish manzili va telefon raqamini kiritish
   - Agar buyurtma summasi 50 000 so'mdan oshsa — yetkazib berish BEPUL bo'lsin, aks holda belgilangan yetkazib berish narxi (masalan 15 000 so'm) qo'shilsin. Bu hisob-kitob savat/checkout sahifasida avtomatik ko'rsatilsin.
   - Buyurtmalar tarixini ko'rish

3. Adminlar uchun funksiyalar (admin panel):
   - Mahsulot qo'shish/tahrirlash/o'chirish
   - Kelgan buyurtmalarni ko'rish va statusini o'zgartirish (yangi, tayyorlanmoqda, yetkazilmoqda, yetkazildi)
   - Yetkazib berish narxi va bepul yetkazib berish chegarasini (hozircha 50 000 so'm) sozlash imkoniyati

4. Dizayn: zamonaviy, toza, mobil qurilmalarga moslashgan (responsive), o'zbek tilida interfeys.

Backend/autentifikatsiya uchun kerakli bo'lsa database yoqilsin (foydalanuvchi rollari: customer va admin ajratilgan holda).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/68909205-92d4-4db4-8dda-7a81e629c439).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
