import { redirect } from "next/navigation";
import { pages } from "@/configs/paths/pages.path";

export default async function BoxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id : "";
  redirect(id ? `${pages.BOXES}?id=${encodeURIComponent(id)}` : pages.BOXES);
}
