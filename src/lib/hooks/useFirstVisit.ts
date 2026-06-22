"use client";

import { useState } from "react";

// Повертає true ЛИШЕ при першому показі цього ключа в межах сесії вкладки.
// Використовується, щоб анімації входу грали тільки при першому завантаженні
// сторінки, а при поверненні (навігація назад) контент з'являвся миттєво —
// інакше морфінг (View Transitions) не має куди приземлити елемент.
export function useFirstVisit(key: string): boolean {
  // Синхронно читаємо в ініціалізаторі (виконується при монтуванні на клієнті),
  // щоб при поверненні firstVisit одразу був false — без кадру анімації,
  // інакше морфінг не встигне приземлити елемент.
  const [firstVisit] = useState<boolean>(() => {
    if (typeof window === "undefined") return true; // сервер
    try {
      const storageKey = `visited:${key}`;
      const seen = sessionStorage.getItem(storageKey) === "1";
      if (!seen) sessionStorage.setItem(storageKey, "1");
      return !seen;
    } catch {
      return true;
    }
  });

  return firstVisit;
}
