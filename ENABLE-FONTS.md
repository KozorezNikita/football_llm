# Увімкнути шрифти (1 хвилина)

У пісочниці Google Fonts заблоковані, тож `next/font` тимчасово вимкнено
в `src/app/layout.tsx`. Вдома (де мережа відкрита) увімкни так:

Відкрий `src/app/layout.tsx` і заміни на:

```tsx
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { display, body, mono } from "./fonts";

export const metadata: Metadata = {
  title: "Football LLM — аналітика",
  description: "Скаутинг-аналітика на даних FotMob",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Шрифти (всі мають кирилицю):
- **Oswald** — display (заголовки, імена): вузький спортивний гротеск, табло-характер
- **Inter** — body
- **Roboto Mono** — усі цифри статистики (tabular)

Хочеш інший display-шрифт? Кандидати з кирилицею і спорт-характером:
Saira / Saira Condensed, Anton (дуже щільний), Bebas Neue (латиниця лише — НЕ для укр).
