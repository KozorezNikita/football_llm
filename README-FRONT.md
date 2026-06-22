# Football LLM — фронтенд (glassy, світла тема, Next 16)

Стек: Next 16.2.9 + React 19.2 + Prisma 7 (adapter-pg) + Framer Motion.
Сміливий спортивний glassy-дизайн. Працює на реальній БД або mock-fallback.

## Запуск
1. `npm install`
2. Увімкни шрифти: див. ENABLE-FONTS.md (1 рядок у layout.tsx)
3. Підключи БД (нижче) АБО лиши mock-режим
4. `npm run dev`

Маршрути: `/` (Ligue 1), `/teams/9748` (Lyon), `/players/1364069` (Cherki)

## Реальна БД (вся Ligue 1)
1. `.env` → `DATABASE_URL=postgresql://...`
2. `npx prisma generate`
3. Готово — `src/lib/data/queries.ts` автоматично піде на Prisma
   (без DATABASE_URL — fallback на mock, тому збирається будь-де).

Прод-чистота: у `getTeamAnalysis` (queries.ts) заміни локальну збірку
на прямий виклик твого `analyzeTeam()` з `@/lib/analytics` — щоб аномалії
та логіка йшли з єдиного джерела. Маркер у коді стоїть.

## Дизайн-мова (Фаза 1)
- Типографіка: Oswald (display, спорт-гротеск) + Inter (body) + Roboto Mono (цифри-табло)
  усі з кирилицею. next/font, self-hosted, zero layout shift.
- .display / .stat-num / .eyebrow — класи в globals.css
- noise-текстура + edge-light на склі (вбивають пластиковість)
- Перцентильні бари: колір = СИЛА (зелений→червоний)
- Клубна тема як акцент (CSS-змінні per-page), safeAccentOnLight() для контрасту

## Структура
src/app/             — сторінки + fonts.ts + globals.css
src/components/ui/    — GlassCard, PercentileBar, BlobBackground, Crest, Breadcrumbs
src/components/{league,team,player} — рівні навігації
src/lib/db.ts         — Prisma 7 клієнт (adapter-pg)
src/lib/data/         — queries (реальні), mock (fallback), types, percentile, radar
src/lib/theme/        — clubColors + логіка контрасту
prisma/schema.prisma  — твоя схема (копія)

## Що далі (наступні фази)
- Фаза 2: оркестрований вхід сторінки (рейтинг-лічильник, послідовність появи)
- Фаза 3: shared element transition (layoutId) League→Team→Player — головний wow
- Фаза 4: розкладка складу по схемі поля, hover-тултіпи з рангом у лізі, лідери команди
