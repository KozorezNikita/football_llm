# ⚽ football-llm

> Football analytics platform with AI-assisted squad scouting — built on real match data, per-90 percentile modelling, and a hybrid math-plus-LLM reporting engine.

**Live demo:** [football-llm.vercel.app](https://football-llm.vercel.app/)
Demo (without registration)
Акаунт 1 / Account 1: nikita@gmail.com / nikita123456
Акаунт 2 / Account 2: dima@gmail.com / dima1234

> 🇬🇧 English below · 🇺🇦 Українська нижче

<!-- TODO: додай 2-3 скріншоти. Рекомендую:
     1. Best XI на полі (сторінка клубу)
     2. Сторінка гравця (радар + позиційне поле + метрики)
     3. Аналіз складу + ШІ-вердикт скаута
     Поклади їх у папку docs/ і встав: ![alt](docs/screenshot-1.png) -->
     
![Best XI](docs/bestxi.png)
![Player profile](docs/player.png)
![Squad analysis & AI scout](docs/scout.png)

---

## 🇬🇧 English

### What it is

football-llm turns raw football match data into readable analytical insight. It ingests season statistics for entire leagues, computes per-90 percentile profiles for every player, builds data-driven best-XIs and formations, and generates a written squad-scouting verdict where **the maths does the analysis and the LLM only voices it**.

The goal was not "another stats table", but a product that *reasons* about a squad: where it is strong, where it is thin, and why — the way an analyst would phrase it.

### Key features

- **League → Team → Player navigation** with a glassmorphism UI and per-club colour theming.
- **Player profiles** — per-90 percentile radar, positional pitch, grouped metric breakdowns, and a token-free programmatic scout note.
- **Data-driven Best XI** across multiple formations, picked by aggregate rating rather than hand-tuned slots.
- **Squad depth analysis** — every position is scored on *starter quality* **and** *depth* (how many adequate alternatives exist), surfacing real reinforcement priorities instead of "the weakest player in the XI".
- **AI scout verdict** — a 3–4 paragraph essay connecting the computed weak zones into football reasoning, cached in the database and regenerated only when the squad actually changes.

### Architecture decisions worth noting

- **Maths computes, the LLM voices.** Ratings, depth, priorities and formation are computed deterministically (zero tokens). The LLM receives a structured summary and turns it into prose — it never invents players, transfers or numbers. Cheap, stable, factually grounded, yet reads like an analyst wrote it.
- **Per-90 percentiles, not absolute totals.** A player who missed half the season through injury is judged on *rate*, not accumulated volume — small samples are compared fairly, with an explicit low-minutes warning when the sample is too small to trust.
- **Hash-based report caching.** The scout report is stored in Postgres alongside a hash of the squad state (formation + starters + ratings + depth). The cached verdict is served instantly and for free; regenerated only when that hash changes — an honest cache that never shows a stale verdict.
- **Ingestion is local-only by design.** Match data is collected via a Playwright client running locally; the result is pushed to the cloud database. The deployed app is read-only over the data, keeping the serverless deployment simple and cheap.

### Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon in production), Prisma 6 ORM
- **AI:** Anthropic Messages API (direct fetch, no SDK)
- **Animation:** Framer Motion, View Transitions API
- **Data ingestion:** Playwright
- **Validation:** Zod
- **Hosting:** Vercel + Neon

### Running locally

```bash
# 1. Install
npm install
npx playwright install chromium   # browser for ingestion

# 2. Environment (.env)
DATABASE_URL="postgresql://user:pass@localhost:5432/football_llm"
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-sonnet-4-6"

# 3. Database
npx prisma db push

# 4. Ingest data for a league (local, uses Playwright)
npm run ingest

# 5. Dev server
npm run dev
```

> Note: the AI scout report consumes Anthropic API tokens on generation (results are cached per squad).

---

## 🇺🇦 Українська

### Що це

football-llm перетворює сирі футбольні дані на читабельну аналітику. Додаток інжестить сезонну статистику цілих ліг, рахує перцентильні профілі гравців у перерахунку на 90 хвилин, будує склади та формації на основі даних і генерує письмовий скаут-вердикт по складу, де **математика виконує аналіз, а LLM лише його озвучує**.

Мета була не «ще одна таблиця статистики», а продукт, що *міркує* про склад: де він сильний, де тонкий і чому — так, як це сформулював би аналітик.

### Ключові можливості

- **Навігація Ліга → Команда → Гравець** із glassmorphism-інтерфейсом і кольоровим темуванням під кожен клуб.
- **Профілі гравців** — перцентильний радар (per-90), позиційне поле, згруповані метрики й програмна скаут-нотатка без витрати токенів.
- **Best XI на основі даних** для кількох формацій, обраний за сумарним рейтингом.
- **Аналіз глибини складу** — кожна позиція оцінюється за *якістю стартера* **та** *глибиною* (скільки адекватних альтернатив є), що показує реальні пріоритети підсилення, а не «найслабшого гравця в XI».
- **ШІ-вердикт скаута** — есе на 3–4 абзаци, що пов'язує обчислені слабкі зони у футбольне міркування; кешується в БД і перегенеровується лише коли склад змінився.

### Архітектурні рішення, варті уваги

- **Математика рахує, LLM озвучує.** Рейтинги, глибина, пріоритети й формація обчислюються детерміновано (нуль токенів). LLM отримує структуроване зведення й перетворює його на текст — не вигадуючи гравців, трансфери чи числа. Дешево, стабільно, фактично обґрунтовано, але живо на читання.
- **Перцентилі per-90, а не абсолютні суми.** Гравець, що пропустив пів сезону через травму, оцінюється за *темпом*, а не обсягом — малі вибірки порівнюються чесно, з явним попередженням про малу кількість хвилин.
- **Кешування звіту за хешем.** Скаут-звіт зберігається в Postgres разом із хешем стану складу (формація + стартери + рейтинги + глибина). Кешований вердикт віддається миттєво; перегенерація — лише коли хеш змінився. Чесний кеш, що не показує застаріле.
- **Інжест навмисно лише локальний.** Дані збираються через Playwright локально, результат пушиться у хмарну БД. Задеплоєний застосунок працює з даними лише на читання — це тримає serverless-деплой простим і дешевим.

### Технічний стек

- **Фреймворк:** Next.js 16 (App Router, Turbopack), React 19
- **Мова:** TypeScript
- **БД:** PostgreSQL (Neon у проді), Prisma 6
- **ШІ:** Anthropic Messages API (прямий fetch, без SDK)
- **Анімація:** Framer Motion, View Transitions API
- **Інжест даних:** Playwright
- **Валідація:** Zod
- **Хостинг:** Vercel + Neon

### Локальний запуск

```bash
npm install
npx playwright install chromium
# заповни .env (DATABASE_URL, ANTHROPIC_API_KEY, ANTHROPIC_MODEL)
npx prisma db push
npm run ingest   # інжест ліги (локально, Playwright)
npm run dev
```

> Скаут-звіт витрачає токени Anthropic при генерації (результат кешується по складу).

---

*Built by Nikita · [Live demo](https://football-llm.vercel.app/)*
