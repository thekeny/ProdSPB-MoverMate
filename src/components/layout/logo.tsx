import Image from "next/image";
import { APP } from "@/configs/consts/app.const";
import { images } from "@/configs/paths/images.path";

export function Logo({ small = false }: { small?: boolean }) {
  if (small)
    return (
      <Image
        src={images.ICON}
        alt={APP.NAME}
        width={34}
        height={34}
        className="rounded-md object-contain"
        priority
      />
    );
  return (
    <div className="flex flex-col gap-1">
      <Image
        src={images.LOGO}
        alt={APP.NAME}
        width={250}
        height={50}
        className="object-contain"
        priority
      />
    </div>
  );
}
