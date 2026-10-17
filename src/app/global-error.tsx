"use client";

import { StatusScreen } from "@/components/layout/status-screen";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ru">
      <body>
        <StatusScreen
          code="Приложение недоступно"
          title="Не удалось запустить приложение."
          description="Обновите страницу. Если не поможет, зайдите чуть позже."
          onRetry={reset}
        />
      </body>
    </html>
  );
}
