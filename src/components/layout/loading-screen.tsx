export function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F5F3EE] p-6">
      <div className="text-center">
        <div className="mx-auto size-10 animate-pulse rounded-lg bg-[#E2E9DD]" />
        <p className="mt-4 text-sm font-bold text-[#1D2923]">Загрузка…</p>
      </div>
    </main>
  );
}
