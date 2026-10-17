"use client";

import { StatusScreen } from "@/components/layout/status-screen";

export default function OfflinePage() {
  return (
    <StatusScreen
      code="Нет сети"
      title="Связь с сервером пропала."
      description="Уже открытые страницы доступны. Новые данные появятся, когда вернётся интернет."
      onRetry={() => window.location.reload()}
    />
  );
}
