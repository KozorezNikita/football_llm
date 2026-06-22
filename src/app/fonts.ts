import { Oswald, Inter, Roboto_Mono } from "next/font/google";

// Display — Oswald: вузький спортивний гротеск, табло-характер, має кирилицю.
// (Archivo на Google Fonts не роздає cyrillic-subset, тому Oswald.)
export const display = Oswald({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Body — Inter (latin + cyrillic).
export const body = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

// Цифри — Roboto Mono (latin + cyrillic, tabular).
export const mono = Roboto_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});
