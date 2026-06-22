# Football LLM — об'єднаний проєкт (бекенд + фронтенд)

Один Next.js проєкт: і дані (інжест/аналітика/scout), і UI (glassy фронт).
Стек: Next 15 + React 19 + Prisma 6 + Playwright + Framer Motion.

## ⚠️ Що це і чому
Раніше фронт випадково затер бекендний package.json. Це — ПРАВИЛЬНЕ
злиття: твій бекенд (з оригінального архіву) + новий фронт в одному дереві,
з усіма залежностями і скриптами. Нічого не загублено.

Лишилися на ОРИГІНАЛЬНИХ версіях (Next 15 + Prisma 6) — бо весь бекенд під
них написаний. Про апгрейд на Next 16 — див. кінець файлу (окремий крок).

## Запуск

1. Встанови залежності:

       npm install
       npx playwright install chromium    # браузер для інжесту (окремо!)

2. .env у корені:

       DATABASE_URL="postgresql://postgres:ПАРОЛЬ@localhost:5432/football_llm"
       ANTHROPIC_API_KEY="sk-ant-..."
       ANTHROPIC_MODEL="claude-sonnet-4-6"

3. Prisma клієнт:

       npm run prisma:generate

4. Запуск:

       npm run dev        # фронт → localhost:3000
       npm run ingest     # збір даних FotMob
       npm run analyze    # аналітика
       npm run scout      # LLM скаут-нотатка

## Маршрути фронту
- /                  Ligue 1 (таблиця)
- /teams/9748        Lyon (склад)
- /players/1364069   гравець (картка, радар, бари, перемикач турнірів)

## ВАЖЛИВО: фікс інжесту вже застосований
client.ts / transform.ts / tournaments.ts / scripts/ingest.ts / config/ingest.ts
вже містять мультитурнірний фікс (Фернандес-Пардо більше не покаже 4 хв).

Config зараз у ТЕСТ-режимі: teamIds=[8639] (Lille), ingestTournamentIds=[53]
(лише Ligue 1). План:
  1. npm run ingest → перевір Фернандеса-Пардо у Studio (має бути ~2379 хв)
  2. ingestTournamentIds=undefined → мультитурнірність (всі турніри окремо)
  3. ingestAllLeagueTeams=true → вся ліга

## Структура
src/app/                 фронт (сторінки + fonts + globals.css)
src/components/          UI-компоненти (ui/league/team/player)
src/lib/data/            queries (реальні Prisma + fallback mock), types, percentile, radar
src/lib/theme/           clubColors (клубна тематизація)
src/lib/analytics/       ТВОЯ аналітика (analyzeTeam, repository, insights)
src/lib/fotmob/          FotMob клієнт + transform + tournaments
src/lib/llm/             scout note (Anthropic)
src/lib/prisma.ts        Prisma 6 клієнт (єдиний на весь проєкт)
src/scripts/             ingest / analyze / scout
prisma/schema.prisma     схема (url у схемі — Prisma 6, НЕ чіпай)

## Примітка про дублювання (не критично)
src/lib/data/queries.ts будує профіль гравця сам (rowToProfile), хоча в тебе
вже є src/lib/analytics/repository.ts. Зараз працюють обидва (queries для фронту).
Потім можна звести фронт на analyzeTeam() напряму — але це НЕ терміново,
все працює як є.

## Якщо захочеш Next 16 (окремим кроком, НЕ зараз)
Це апгрейд з breaking changes (Prisma 7 adapter, prisma.config.ts).
Робити окремо, коли поточне стабільно працює. Зараз — Next 15 + Prisma 6.

## Шрифти
Увімкнені (Oswald display + Inter body + Roboto Mono цифри, усі з кирилицею).
Вантажаться з Google Fonts при білді — потрібен інтернет (у тебе є).
