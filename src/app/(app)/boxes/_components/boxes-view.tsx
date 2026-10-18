import {
  type Box,
  ChevronRight,
  PackageCheck,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { TextInput } from "@/components/ui/text-input";
import { LIST_PAGE_SIZE } from "@/configs/consts/lists.const";
import type { Item, MoveBox, Status } from "@/configs/types/box.type";
import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export function BoxesView({
  boxes,
  allBoxes,
  items,
  itemResults,
  searching,
  hasMoreResults,
  loadingMore,
  onMoreResults,
  rooms,
  totalCount,
  canEdit,
  search,
  setSearch,
  searchRef,
  roomFilter,
  setRoomFilter,
  roomIcon,
  status,
  onAdd,
  onSelect,
  onDeselect: _onDeselect,
  onResetFilters,
}: {
  boxes: MoveBox[];
  allBoxes: MoveBox[];
  items: Item[];
  itemResults: Item[];
  searching: boolean;
  hasMoreResults: boolean;
  loadingMore: boolean;
  onMoreResults: () => void;
  rooms: string[];
  totalCount: number;
  canEdit: boolean;
  search: string;
  setSearch: (value: string) => void;
  searchRef?: (element: HTMLElement | null) => void;
  roomFilter: string;
  setRoomFilter: (value: string) => void;
  roomIcon: (name: string) => typeof Box;
  status: (key: Status) => { key: Status; label: string; color: string };
  onAdd: () => void;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  onResetFilters: () => void;
}) {
  const isFiltered = Boolean(search) || roomFilter !== "all";
  const listKey = `${search}:${roomFilter}`;
  const [window, setWindow] = useState({ key: listKey, limit: LIST_PAGE_SIZE });
  const limit = window.key === listKey ? window.limit : LIST_PAGE_SIZE;
  const boxesById = useMemo(
    () => new Map(allBoxes.map((box) => [box.id, box])),
    [allBoxes],
  );
  const itemsByBox = useMemo(() => {
    const grouped = new Map<string, Item[]>();
    for (const item of items)
      if (item.boxId && item.state === "IN_BOX") {
        const contents = grouped.get(item.boxId) ?? [];
        contents.push(item);
        grouped.set(item.boxId, contents);
      }
    return grouped;
  }, [items]);
  return (
    <>
      <PageHeading
        eyebrow="Инвентарь"
        title="Коробки и вещи"
        description="Записывайте, что лежит в каждой коробке, и находите нужное до, во время и после переезда."
        action={
          canEdit ? (
            <Button onClick={onAdd} className="h-11">
              <Plus />
              Новая коробка
            </Button>
          ) : undefined
        }
      />
      <section className="no-print mt-6 rounded-lg bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5C6560]" />
            <TextInput
              maxLength={100}
              ref={searchRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="По началу слова: «зар» найдёт «зарядка»"
              aria-label="Поиск вещи"
              className="w-full px-10"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSearch("")}
                aria-label="Очистить поиск"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5C6560]"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold text-[#5C6560]">
            Коробки по комнатам
          </p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {[
              { name: "Все", value: "all" as const },
              ...rooms.map((room) => ({ name: room, value: room })),
            ].map((item) => (
              <Button
                variant="ghost"
                key={item.value}
                onClick={() => setRoomFilter(item.value)}
                className={cn(
                  "h-auto shrink-0 rounded-full px-3 py-2 text-xs font-bold transition-colors duration-200",
                  roomFilter === item.value
                    ? "bg-[#1D2923] text-[#F4F1E9] hover:bg-[#1D2923] hover:text-[#F4F1E9]"
                    : "bg-[#E8E2D5] text-[#42664D] hover:bg-[#D9D1C2] hover:text-[#42664D]",
                )}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      </section>
      {search.trim() && (
        <section className="mt-5 rounded-lg bg-white p-5">
          <h2 className="font-extrabold">
            Найденные вещи{" "}
            <span className="text-sm font-medium text-[#5C6560]">
              {itemResults.length}
            </span>
          </h2>
          {searching ? (
            <output className="mt-3 block text-sm text-[#5C6560]">
              Ищем вещи…
            </output>
          ) : itemResults.length ? (
            <div className="mt-3 grid gap-2">
              {itemResults.map((item) => {
                const relatedBox = item.boxId
                  ? boxesById.get(item.boxId)
                  : null;
                const location = relatedBox
                  ? `№ ${relatedBox.number} · ${relatedBox.room} · ${status(relatedBox.status).label}`
                  : `${item.state === "LOST" ? "Потеряна" : item.state === "TAKEN_OUT" ? "На месте" : item.state === "TO_PACK" ? "Нужно упаковать" : "В коробке"} · ${item.sourceRoom}`;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-start gap-2 rounded-md bg-[#F5F3EE] p-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3"
                  >
                    <span className="w-full min-w-0 [overflow-wrap:anywhere] sm:w-auto sm:flex-1">
                      <strong>{item.name}</strong>
                      {item.quantity > 1 && ` · ${item.quantity} шт.`}
                    </span>
                    <span className="text-xs text-[#5C6560] [overflow-wrap:anywhere]">
                      {location}
                    </span>
                    {relatedBox && (
                      <Button
                        variant="link"
                        onClick={() => onSelect(relatedBox.id)}
                      >
                        Открыть коробку
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#5C6560]">
              Вещей с таким началом слова нет.
            </p>
          )}
          {hasMoreResults && (
            <Button
              className="mt-3"
              variant="outline"
              disabled={loadingMore || searching}
              loading={loadingMore}
              onClick={onMoreResults}
            >
              Ещё результаты
            </Button>
          )}
        </section>
      )}
      <section className="tnum mt-5 flex items-center justify-between text-sm text-[#5C6560]">
        <span>
          {isFiltered ? `${boxes.length} из ` : ""}
          {totalCount} {plural(totalCount, ["коробка", "коробки", "коробок"])}
        </span>
        {search && <span>Поиск: «{search}»</span>}
      </section>
      <section className="mt-3 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {boxes.length ? (
          boxes.slice(0, limit).map((box) => {
            const RoomIcon = roomIcon(box.room);
            const contents = itemsByBox.get(box.id) ?? [];
            return (
              <Button
                variant="ghost"
                key={box.id}
                onClick={() => onSelect(box.id)}
                className="group h-full w-full flex-col items-stretch justify-start self-stretch rounded-lg bg-white p-5 text-left whitespace-normal transition-colors duration-200 hover:bg-[#E2E9DD] hover:text-[#1D2923]"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#1D2923] px-2 py-1 font-mono text-xs font-bold text-[#F4F1E9]">
                      № {box.number}
                    </span>
                    <span className="flex min-w-0 items-center gap-1 text-xs font-bold text-[#42664D] [overflow-wrap:anywhere]">
                      <RoomIcon className="size-3.5" />
                      {box.room}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[10px] font-extrabold",
                      status(box.status).color,
                    )}
                  >
                    {status(box.status).label}
                  </span>
                </div>
                <h2 className="mt-5 break-words text-lg font-extrabold tracking-[-0.03em] [overflow-wrap:anywhere]">
                  {box.title}
                </h2>
                {box.fragile && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#F9E8E2] px-2 py-1 text-[10px] font-bold text-[#A84D3C]">
                      Хрупкое
                    </span>
                  </div>
                )}
                <div className="mt-3 rounded-md bg-[#F5F3EE] p-3 text-xs text-[#5C6560]">
                  <div className="flex flex-wrap gap-1.5">
                    {contents.length ? (
                      <>
                        {contents.slice(0, 2).map((item) => (
                          <span
                            key={item.id}
                            className="max-w-full break-words rounded-md bg-[#E8E2D5] px-2 py-1 [overflow-wrap:anywhere]"
                          >
                            {item.name}
                          </span>
                        ))}
                        {contents.length > 2 && (
                          <span className="px-1 py-1">
                            +{contents.length - 2}
                          </span>
                        )}
                      </>
                    ) : (
                      <span>Список вещей пуст</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between font-bold text-[#42664D]">
                    <span className="tnum">
                      В коробке {contents.length}{" "}
                      {plural(contents.length, ["вещь", "вещи", "вещей"])}
                    </span>
                    <span className="flex items-center gap-1">
                      Открыть{" "}
                      <ChevronRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Button>
            );
          })
        ) : isFiltered ? (
          <div className="col-span-full rounded-lg bg-white/60 p-12 text-center">
            <Search className="mx-auto size-8 text-[#5C6560]" />
            <p className="mt-4 font-bold">Ничего не найдено</p>
            <p className="mt-1 text-sm text-[#5C6560]">
              {search
                ? `По запросу «${search}» ничего нет.`
                : "В этой комнате коробок нет."}
            </p>
            <Button variant="outline" className="mt-5" onClick={onResetFilters}>
              <X />
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div className="col-span-full rounded-lg bg-white/60 p-12 text-center">
            <PackageCheck className="mx-auto size-8 text-[#42664D]" />
            <p className="mt-4 font-bold">Коробок пока нет</p>
            <p className="mt-1 text-sm text-[#5C6560]">
              Нажмите «Новая коробка», чтобы добавить первую.
            </p>
          </div>
        )}
      </section>
      {boxes.length > limit && (
        <Button
          className="mt-4"
          variant="outline"
          onClick={() =>
            setWindow({ key: listKey, limit: limit + LIST_PAGE_SIZE })
          }
        >
          Ещё коробки · показано {limit} из {boxes.length}
        </Button>
      )}
    </>
  );
}
