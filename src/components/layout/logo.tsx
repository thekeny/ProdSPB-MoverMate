import Image from "next/image";
import Link from "next/link";
import { APP } from "@/configs/consts/app.const";
import { images } from "@/configs/paths/images.path";
import { pages } from "@/configs/paths/pages.path";

export function Logo({
  small = false,
  href,
}: {
  small?: boolean;
  href?: string;
}) {
  const image = small ? (
    <Image
      src={images.ICON}
      alt={APP.NAME}
      width={34}
      height={34}
      className="rounded-md object-contain"
      priority
    />
  ) : (
    <Image
      src={images.LOGO}
      alt={APP.NAME}
      width={250}
      height={50}
      className="object-contain"
      priority
    />
  );
  if (!href) return image;
  return (
    <Link href={href} aria-label={APP.NAME} className="w-fit">
      {image}
    </Link>
  );
}

export function AppLogo({ small = false }: { small?: boolean }) {
  return <Logo small={small} href={pages.DASHBOARD} />;
}
