"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { statuses } from "@/configs/consts/statuses.const";
import { PROJECTS_STORAGE_PREFIX } from "@/configs/consts/storage.const";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";
import type { MoveBox } from "@/configs/types/box.type";
import type { Project } from "@/configs/types/project.type";
import { normalizeProject } from "@/lib/project-storage";
import { useAuth } from "@/providers/auth-provider";
import { useProjects } from "@/providers/projects-provider";

export default function TokenBoxPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { account, ready: authReady } = useAuth();
  const { projects, ready: projectsReady, setActiveId } = useProjects();
  const [browserMatch, setBrowserMatch] = useState<{
    project: Project;
    box: MoveBox;
  } | null>(null);
  const [browserSearchDone, setBrowserSearchDone] = useState(false);
  useEffect(() => {
    try {
      const keys = Array.from({ length: localStorage.length }, (_, index) =>
        localStorage.key(index),
      ).filter((key): key is string =>
        Boolean(key?.startsWith(`${PROJECTS_STORAGE_PREFIX}:`)),
      );
      for (const key of keys) {
        const saved = localStorage.getItem(key);
        if (!saved) continue;
        const data = JSON.parse(saved) as { projects?: unknown };
        const found = Array.isArray(data.projects)
          ? data.projects
              .map((entry) => normalizeProject(entry))
              .find(
                (project) =>
                  project?.qrCodeStrategy === "open" &&
                  project.boxes.some((box) => box.qrToken === token),
              )
          : null;
        if (found) {
          const box = found.boxes.find((entry) => entry.qrToken === token);
          if (box) setBrowserMatch({ project: found, box });
          break;
        }
      }
    } catch {
      // Unreadable local projects stay unavailable from a QR link.
    }
    setBrowserSearchDone(true);
  }, [token]);
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
  const match = protectedMatch ?? browserMatch;

  useEffect(() => {
    if (authReady && browserSearchDone && !account && !browserMatch)
      router.replace(
        `${pages.LOGIN}?${QUERY_PARAMS.NEXT}=${encodeURIComponent(`${pages.BOX_TOKEN}/${token}`)}`,
      );
  }, [account, authReady, browserMatch, browserSearchDone, router, token]);

  if (!authReady || !projectsReady || !browserSearchDone) return null;
  if (!match)
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-extrabold">Коробка не найдена</h1>
        <p className="mt-3 text-sm text-[#68716C]">
          Карточка доступна в браузере, где сохранён проект.
        </p>
        <Button className="mt-5" onClick={() => router.push(pages.PROJECTS)}>
          К проектам
        </Button>
      </main>
    );
  const { project, box } = match;
  const canWrite = Boolean(
    account &&
      project.members.includes(account.username) &&
      projects.some((entry) => entry.id === project.id),
  );
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
