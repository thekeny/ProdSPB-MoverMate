"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getBoxByQr } from "@/api/generated";
import { ApiError, unwrap } from "@/api/request";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/configs/consts/api.const";
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
  const boxQuery = useQuery({
    queryKey: [...QUERY_KEYS.BOX_BY_QR(token), account?.id ?? "anonymous"],
    enabled: authReady && Boolean(token),
    retry: false,
    queryFn: () => unwrap(getBoxByQr({ path: { qr_token: token } })),
  });

  useEffect(() => {
    if (
      boxQuery.error instanceof ApiError &&
      boxQuery.error.status === 401 &&
      !account
    )
      router.replace(
        `${pages.LOGIN}?${QUERY_PARAMS.NEXT}=${encodeURIComponent(`${pages.BOX_TOKEN}/${token}`)}`,
      );
  }, [account, boxQuery.error, router, token]);

  if (
    !authReady ||
    (boxQuery.error instanceof ApiError &&
      boxQuery.error.status === 401 &&
      !account)
  )
    return null;
  if (boxQuery.isPending)
    return (
      <main className="mx-auto max-w-xl p-6 text-sm text-[#5C6560]">
        Загружаем коробку…
      </main>
    );
  if (boxQuery.error || !boxQuery.data)
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-extrabold">
          {boxQuery.error instanceof ApiError && boxQuery.error.status === 404
            ? "Коробка не найдена"
            : "Не удалось загрузить коробку"}
        </h1>
        <p className="mt-3 text-sm text-[#5C6560]">
          {boxQuery.error instanceof ApiError && boxQuery.error.status === 404
            ? "Ссылка недействительна или у вас нет доступа."
            : "Проверьте подключение и попробуйте ещё раз."}
        </p>
        <Button className="mt-5 mr-2" onClick={() => void boxQuery.refetch()}>
          Повторить
        </Button>
        <Button className="mt-5" onClick={() => router.push(pages.PROJECTS)}>
          К проектам
        </Button>
      </main>
    );

  const { project, box, access } = boxQuery.data;
  const canWrite = access === "WRITE";
  const projectInAccount = projects.find((entry) => entry.id === project.id);
  const status = statuses.find(
    (entry) => entry.key.toUpperCase() === box.status,
  );
  return (
    <main className="mx-auto max-w-xl p-6">
      <p className="text-sm text-[#42664D]">{project.name}</p>
      <h1 className="mt-2 text-3xl font-extrabold">Коробка № {box.number}</h1>
      <p className="mt-2 text-[#5C6560]">
        {box.title || "Без названия"} · {box.destination_room.name}
      </p>
      <p className="mt-2 text-sm font-bold text-[#42664D]">{status?.label}</p>
      {!canWrite && (
        <p className="mt-2 text-xs text-[#5C6560]">
          Только просмотр по QR-ссылке.
        </p>
      )}
      {box.is_fragile && (
        <p className="mt-3 font-bold text-[#A84D3C]">Хрупкое</p>
      )}
      <section className="mt-6 rounded-lg bg-white p-5">
        <h2 className="font-extrabold">Содержимое</h2>
        {box.items.length ? (
          <ul className="mt-3 list-inside list-disc text-sm">
            {box.items.map((item) => (
              <li key={item.id}>
                <span className="[overflow-wrap:anywhere]">{item.name}</span>
                {item.quantity > 1 ? ` — ${item.quantity} шт.` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[#5C6560]">Вещей пока нет.</p>
        )}
      </section>
      {canWrite && (
        <Button
          className="mt-5"
          disabled={!projectsReady || !projectInAccount}
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
