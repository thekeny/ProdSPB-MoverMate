"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { statuses } from "@/configs/consts/statuses.const";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";
import { useAuth } from "@/providers/auth-provider";
import { useProjects } from "@/providers/projects-provider";

export default function TokenBoxPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { account, ready: authReady } = useAuth();
  const { projects, ready: projectsReady, setActiveId } = useProjects();
  const accountMatch = projects
    .flatMap((project) => project.boxes.map((box) => ({ project, box })))
    .find(({ box }) => box.qrToken === token);
  const protectedMatch =
    accountMatch?.project.qrCodeStrategy === "protected" &&
    account &&
    (accountMatch.project.ownerId === account.id ||
      accountMatch.project.members.includes(account.username))
      ? accountMatch
      : null;
  const match =
    protectedMatch ??
    (accountMatch?.project.qrCodeStrategy === "open" ? accountMatch : null);

  useEffect(() => {
    if (authReady && !account)
      router.replace(
        `${pages.LOGIN}?${QUERY_PARAMS.NEXT}=${encodeURIComponent(`${pages.BOX_TOKEN}/${token}`)}`,
      );
  }, [account, authReady, router, token]);

  if (!authReady || !projectsReady || !account) return null;
  if (!match)
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-extrabold">Коробка не найдена</h1>
        <p className="mt-3 text-sm text-[#68716C]">
          Проект или коробка недоступны для этого аккаунта.
        </p>
        <Button className="mt-5" onClick={() => router.push(pages.PROJECTS)}>
          К проектам
        </Button>
      </main>
    );
  const { project, box } = match;
  const canWrite = project.members.includes(account.username);
  const contents = project.items.filter(
    (item) => item.boxId === box.id && item.state === "IN_BOX",
  );
  return (
    <main className="mx-auto max-w-xl p-6">
      <p className="text-sm text-[#42664D]">{project.name}</p>
      <h1 className="mt-2 text-3xl font-extrabold">Коробка № {box.number}</h1>
      <p className="mt-2 text-[#68716C]">
        {box.title} · {box.room}
      </p>
      <p className="mt-2 text-sm font-bold text-[#42664D]">
        {statuses.find((entry) => entry.key === box.status)?.label}
      </p>
      {!canWrite && (
        <p className="mt-2 text-xs text-[#68716C]">
          Только просмотр по QR-ссылке.
        </p>
      )}
      {box.fragile && <p className="mt-3 font-bold text-[#A84D3C]">Хрупкое</p>}
      <section className="mt-6 rounded-lg bg-white p-5">
        <h2 className="font-extrabold">Содержимое</h2>
        {contents.length ? (
          <ul className="mt-3 list-inside list-disc text-sm">
            {contents.map((item) => (
              <li key={item.id}>
                {item.name}
                {item.quantity > 1 ? ` — ${item.quantity} шт.` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[#68716C]">Вещей пока нет.</p>
        )}
      </section>
      {canWrite && (
        <Button
          className="mt-5"
          onClick={() => {
            setActiveId(project.id);
            router.push(
              `${pages.BOXES}?${QUERY_PARAMS.BOX_ID}=${encodeURIComponent(box.id)}`,
            );
          }}
        >
          Открыть в проекте
        </Button>
      )}
    </main>
  );
}
