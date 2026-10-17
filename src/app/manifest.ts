import type { MetadataRoute } from "next";
import { APP } from "@/configs/consts/app.const";
import { images } from "@/configs/paths/images.path";
import { pages } from "@/configs/paths/pages.path";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP.TITLE,
    short_name: APP.NAME,
    description: APP.DESCRIPTION,
    start_url: pages.ROOT,
    display: "standalone",
    background_color: APP.THEME_COLOR,
    theme_color: APP.THEME_COLOR,
    lang: APP.LOCALE,
    icons: [
      {
        src: images.FAVICON,
        sizes: "334x334",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
