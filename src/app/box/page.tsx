import { redirect } from "next/navigation";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";

export default async function BoxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawId = params[QUERY_PARAMS.BOX_ID];
  const id = typeof rawId === "string" ? rawId : "";
  const query = id
    ? `?${new URLSearchParams({ [QUERY_PARAMS.BOX_ID]: id })}`
    : "";
  redirect(`${pages.BOXES}${query}`);
}
