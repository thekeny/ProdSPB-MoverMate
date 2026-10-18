import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getItemSuggestions } from "@/api/generated";
import { unwrap } from "@/api/request";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/configs/consts/api.const";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";

export function LostItemSuggestions({
  projectId,
  itemId,
  online,
}: {
  projectId: string;
  itemId: string;
  online: boolean;
}) {
  const query = useQuery({
    queryKey: QUERY_KEYS.ITEM_SUGGESTIONS(projectId, itemId),
    enabled: online,
    queryFn: () => unwrap(getItemSuggestions({ path: { item_id: itemId } })),
  });
  return (
    <div className="basis-full text-xs text-[#5C6560]">
      {query.data?.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <span>Проверьте коробки:</span>
          {query.data.map(({ box, matches }) => (
            <Link
              key={box.id}
              className="inline-flex min-h-11 max-w-full items-center rounded-md bg-[#EDF1E8] px-3 py-2 font-bold text-[#42664D] underline underline-offset-4 [overflow-wrap:anywhere]"
              href={`${pages.BOXES}?${QUERY_PARAMS.BOX_ID}=${encodeURIComponent(box.id)}`}
            >
              № {box.number} · {box.destination_room.name} · совпадений:{" "}
              {matches}
            </Link>
          ))}
        </div>
      ) : query.isError ? (
        <div role="alert">
          Не удалось загрузить подсказки.{" "}
          {online && (
            <Button variant="link" onClick={() => void query.refetch()}>
              Повторить
            </Button>
          )}
        </div>
      ) : query.data ? (
        "Подходящих нераспакованных коробок пока нет."
      ) : online ? (
        "Ищем подходящие коробки…"
      ) : (
        "Для новых подсказок подключитесь к интернету."
      )}
    </div>
  );
}
