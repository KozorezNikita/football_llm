import "./globals.css";
import * as React from "react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { display, body, mono } from "./fonts";
import { LeaguePattern } from "@/components/ui/LeaguePattern";

export const metadata: Metadata = {
  title: "Football LLM — аналітика",
  description: "Скаутинг-аналітика на даних FotMob",
};

// View Transitions у React 19.2. Назва експорту могла лишитись з префіксом
// unstable_ або без нього — беремо той, що реально є, з безпечним фолбеком.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const R = React as any;
const ViewTransition: React.FC<{ children: ReactNode }> =
  R.ViewTransition ?? R.unstable_ViewTransition ?? (({ children }: { children: ReactNode }) => <>{children}</>);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {/* Глобальний патерн-фон ПОЗА ViewTransition — не блимає.
            Кольори керуються CSS-змінними, які виставляє кожна сторінка. */}
        <LeaguePattern />
        <ViewTransition>{children}</ViewTransition>
      </body>
    </html>
  );
}
