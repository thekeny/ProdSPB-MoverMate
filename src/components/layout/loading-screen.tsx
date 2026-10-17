import Image from "next/image";
import { images } from "@/configs/paths/images.path";

export function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F5F3EE] p-6">
      <div className="text-center">
        <Image
          src={images.ICON}
          alt=""
          width={56}
          height={56}
          priority
          className="mx-auto animate-[loading-bob_0.8s_infinite] object-contain"
        />
        <p className="mt-4 text-sm font-bold text-[#1D2923]">Загрузка…</p>
      </div>
    </main>
  );
}
