import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F5F3EE] p-6">
      <div className="text-center">
        <Loader2
          aria-label="Загрузка"
          className="mx-auto size-10 animate-spin text-[#42664D]"
        />
        <p className="mt-4 text-sm font-bold text-[#1D2923]">Загрузка…</p>
      </div>
    </main>
  );
}
