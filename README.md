# 📘 Local Help

> Гіперлокальна платформа для обміну послугами

---

## 👤 Автор

- **ПІБ**: Жованик Олександр
- **Група**: ФЕП-41
- **Керівник**: доц. Ляшкевич Марія
- **Дата виконання**: [27.01.2004]

---

## 📌 Загальна інформація

- **Тип проєкту**: Вебсайт
- **Мова програмування**: TypeScript (Next.js)
- **Фреймворки / Бібліотеки**: Next.js, PostgreSQL, Drizzle, Vercel

---

## 🧠 Опис функціоналу

- 🔐 Реєстрація та авторизація користувачів
- 🗒️ Створення локальних постів, та постів в розділі Lost&Found
- 💬 Чат
- 🌐 tRPC для взаємодії між клієнтською та серверною частинами
- 📱 Адаптивний інтерфейс

---

## 🧱 Опис основних класів / файлів

| Клас / Файл     | Призначення |
|----------------|-------------|
| `src/server/api/routers/chat.ts` | Опис функцій чату |
| `src/server/api/routers/post.ts` | Опис функцій постів |
| `src/server/db/schema.ts` | Опис схем БД |

---

## ▶️ Як запустити проєкт "з нуля"

### 1. Встановлення інструментів

- Node.js v22.16.0 + npm v11.4.1

### 2. Клонування репозиторію

```bash
git clone https://github.com/fdsssawe/local-help
cd local-help
```

### 3. Встановлення залежностей

```bash
npm install
```

### 4. Створення `.env` файлів

#### Для backend:

```
POSTGRES_URL: Standard connection URL with SSL.
POSTGRES_PRISMA_URL: Connection URL optimized for Prisma with pgbouncer.
POSTGRES_URL_NO_SSL: Connection URL without SSL.
POSTGRES_URL_NON_POOLING: Connection URL without connection pooling.
POSTGRES_URL_SUPABASE: Connection URL for a Supabase PostgreSQL instance.
Individual PostgreSQL connection parameters: POSTGRES_USER, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_DATABASE.
NEXT_PUBLIC_MAPBOX_API_KEY: Used for Mapbox services.
Clerk Authentication Keys:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Public key for Clerk authentication.
CLERK_SECRET_KEY: Secret key for Clerk authentication.
NEXT_PUBLIC_SUPABASE_URL: URL for your Supabase project.
NEXT_PUBLIC_SUPABASE_ANON_KEY: Anonymous public key for Supabase.
```


## 🖱️ Інструкція для користувача

1. **Головна сторінка** — вітання і кнопки:
   - `Sign` — авторизація існуючого користувача/створення нового профілю

2. **Після входу**:
   - Розділ `Post`, кнопка `Post` відкриває форму створення посту
   - Розділ `Post`, кнопка `My Posts` відкриває сторінку для перегляду властих постів
   - Розділ `Post`, кнопка `Local` відкриває сторінку для перегляду локальних постів

3. **Інші функції**:
   - `🚪 Вийти` — завершує сесію користувача

---

## 📷 Приклади / скриншоти

- Головна сторінка
![mainpage](https://9av8d6dfyy.ufs.sh/f/c2vd1pTpd30hSNyO1PqkMaP3tGL9ZpxvWVX46oqgnUEulyYH)
- Список нотаток
![postpage](https://9av8d6dfyy.ufs.sh/f/c2vd1pTpd30h54BQqQ6AIvc0misRw72hpoMfgKCUZT8Q3kqa)
- Форма додавання
![localposts](https://9av8d6dfyy.ufs.sh/f/c2vd1pTpd30hy13cH9ZjmpKtdMUCY09HuzE7saqbRvZV5ieW)
---

## 🧪 Проблеми і рішення

| Проблема              | Рішення                            |
|----------------------|------------------------------------|
| 404 на сторінці чату | Підняти базу даних локально |
| 404 на будь якій сторінкі | перевірити .env |

---

## 🧾 Використані джерела / література

- Next.js документація
- t3 stack документація




