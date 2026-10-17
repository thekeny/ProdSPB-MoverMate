"use client";

import { StatusScreen } from "@/components/layout/status-screen";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <StatusScreen
      code="Что-то сломалось"
      title="Страница не открылась."
      description="Это сбой на нашей стороне. Попробуйте ещё раз или вернитесь на главную."
      onRetry={reset}
    />
  );
}
