import {
  type Box,
  ChevronRight,
  PackageCheck,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { TextInput } from "@/components/ui/text-input";
import type { Item, MoveBox, Status } from "@/configs/types/box.type";
import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export function BoxesView({
  boxes,
  allBoxes,
  items,
  itemResults,
  rooms,
  totalCount,
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
  rooms: string[];
  totalCount: number;
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
  return (
    <>
      <PageHeading
        eyebrow="Инвентарь"
        title="Коробки и вещи"
        description="Записывайте, что лежит в каждой коробке, и находите нужное до, во время и после переезда."
        action={
          <Button onClick={onAdd} className="h-11">
            <Plus />
            Новая коробка
          </Button>
        }
      />
      <section className="no-print rounded-lg bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68716C]" />
            <TextInput
              ref={searchRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="По началу слова: «зар» найдёт «зарядка»"
              aria-label="Поиск по коробкам и вещам"
              className="w-full pl-10"
            />
          </div>
          <Button
            variant="outline"
            className="h-11"
            onClick={onResetFilters}
            disabled={!isFiltered}
          >
            <X />
            Очистить
          </Button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
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
                  ? "bg-[#1D2923] text-[#F4F1E9]"
                  : "bg-[#E8E2D5] text-[#42664D] hover:bg-[#E2E9DD]",
              )}
            >
              {item.name}
            </Button>
          ))}
        </div>
      </section>
      <section className="tnum mt-5 flex items-center justify-between text-sm text-[#68716C]">
        <span>
          {isFiltered ? `${boxes.length} из ` : ""}
          {totalCount} {plural(totalCount, ["коробка", "коробки", "коробок"])}
        </span>
        {search && <span>Поиск: «{search}»</span>}
      </section>
      <section className="mt-3 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {boxes.length ? (
          boxes.map((box) => {
            const RoomIcon = roomIcon(box.room);
            const contents = items.filter(
              (item) => item.boxId === box.id && item.state === "IN_BOX",
            );
            return (
              <Button
                variant="ghost"
                key={box.id}
                onClick={() => onSelect(box.id)}
                className="group h-full w-full flex-col items-stretch justify-start self-stretch rounded-lg bg-white p-5 text-left whitespace-normal transition-colors duration-200 hover:bg-[#EDF1E8]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#1D2923] px-2 py-1 font-mono text-xs font-bold text-[#F4F1E9]">
                      № {box.number}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#42664D]">
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
                <h2 className="mt-5 text-lg font-extrabold tracking-[-0.03em]">
                  {box.title}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {box.fragile && (
                    <span className="rounded-full bg-[#F9E8E2] px-2 py-1 text-[10px] font-bold text-[#A84D3C]">
                      Хрупкое
                    </span>
                  )}
                </div>
                <div className="mt-5 rounded-md bg-[#F5F3EE] p-3 text-xs text-[#68716C]">
                  <div className="flex flex-wrap gap-1.5">
                    {contents.length ? (
                      <>
                        {contents.slice(0, 2).map((item) => (
                          <span
                            key={item.id}
                            className="max-w-full truncate rounded-md bg-[#E8E2D5] px-2 py-1"
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
            <Search className="mx-auto size-8 text-[#68716C]" />
            <p className="mt-4 font-bold">Ничего не найдено</p>
            <p className="mt-1 text-sm text-[#68716C]">
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
            <p className="mt-1 text-sm text-[#68716C]">
              Нажмите «Новая коробка», чтобы добавить первую.
            </p>
          </div>
        )}
      </section>
      {search.trim() && (
        <section className="mt-6 rounded-lg bg-white p-5">
          <h2 className="font-extrabold">
            Найденные вещи{" "}
            <span className="text-sm font-medium text-[#68716C]">
              {itemResults.length}
            </span>
          </h2>
          {itemResults.length ? (
            <div className="mt-3 grid gap-2">
              {itemResults.map((item) => {
                const relatedBox = item.boxId
                  ? allBoxes.find((entry) => entry.id === item.boxId)
                  : null;
                const location = relatedBox
                  ? `№ ${relatedBox.number} · ${status(relatedBox.status).label}`
                  : `${item.state === "LOST" ? "Потеряна" : item.state === "TAKEN_OUT" ? "На месте" : item.state === "TO_PACK" ? "Нужно упаковать" : "В коробке"} · ${item.sourceRoom}`;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-md bg-[#F5F3EE] p-3 text-sm"
                  >
                    <span className="min-w-0 flex-1">
                      <strong>{item.name}</strong>
                      {item.quantity > 1 && ` · ${item.quantity} шт.`}
                    </span>
                    <span className="shrink-0 text-right text-xs text-[#68716C]">
                      {location}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#68716C]">
              Вещей с таким началом слова нет.
            </p>
          )}
        </section>
      )}
    </>
  );
}
