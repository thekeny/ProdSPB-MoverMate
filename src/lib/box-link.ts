import { pages } from "@/configs/paths/pages.path";

export function boxLink(token: string) {
  return `${window.location.origin}${pages.BOX_TOKEN}/${encodeURIComponent(token)}`;
}

export async function copyBoxLink(token: string) {
  const url = boxLink(token);
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return;
  }
  const input = document.createElement("textarea");
  input.value = url;
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}
