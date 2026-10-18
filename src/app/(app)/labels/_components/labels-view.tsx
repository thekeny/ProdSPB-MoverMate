import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import type { BoxLabel } from "@/api/generated/types.gen";
import { Qr } from "@/components/box/qr";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeading } from "@/components/ui/page-heading";
import type { Project } from "@/configs/types/project.type";
import { boxLink } from "@/lib/box-link";

export function LabelsView({
  project,
  labels,
  onSelect,
}: {
  project: Project;
  labels?: BoxLabel[];
  onSelect: (id: string) => void;
}) {
  const boxes =
    labels?.map((box) => ({
      id: box.id,
      number: box.number,
      title: box.title ?? "",
      room: box.destination_room.name,
      fragile: box.is_fragile,
      qrToken: box.qr_token,
      itemNames: box.item_names,
    })) ??
    project.boxes.map((box) => ({
      id: box.id,
      number: box.number,
      title: box.title,
      room: box.room,
      fragile: box.fragile,
      qrToken: box.qrToken,
      itemNames: project.items
        .filter((item) => item.boxId === box.id && item.state === "IN_BOX")
        .map((item) => item.name),
    }));
  const [selected, setSelected] = useState<string[]>(
    boxes.map((box) => box.id),
  );
  const boxIds = JSON.stringify(boxes.map((box) => box.id));
  useEffect(() => setSelected(JSON.parse(boxIds) as string[]), [boxIds]);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const allSelected =
    boxes.length > 0 && boxes.every((box) => selected.includes(box.id));
  return (
    <>
      <PageHeading
        eyebrow="Маркировка"
        title="Этикетки с QR-кодами"
        description="Выберите коробки для печати. QR-код открывает карточку коробки."
        action={
          <Button
            onClick={() => window.print()}
            disabled={!selected.length}
            className="no-print h-11"
          >
            <Printer />
            Печать / PDF
          </Button>
        }
      />
      {boxes.length > 0 && (
        <div className="no-print mb-4 flex items-center gap-2 text-sm font-bold">
          <Checkbox
            aria-label="Выбрать все коробки"
            checked={allSelected}
            onCheckedChange={() =>
              setSelected(allSelected ? [] : boxes.map((box) => box.id))
            }
          />
          Выбрать все
        </div>
      )}
      <section className="print-labels grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {boxes.length ? (
          boxes.map((box) => {
            const url = origin ? boxLink(box.qrToken) : "";
            return (
              <article
                key={box.id}
                className={`print-label print-color-adjust min-w-0 break-inside-avoid rounded-lg bg-white p-5 ${selected.includes(box.id) ? "" : "print:hidden"}`}
              >
                <div className="no-print mb-3 flex items-center gap-2">
                  <Checkbox
                    checked={selected.includes(box.id)}
                    onCheckedChange={() =>
                      setSelected((current) =>
                        current.includes(box.id)
                          ? current.filter((id) => id !== box.id)
                          : [...current, box.id],
                      )
                    }
                    aria-label={`Выбрать коробку № ${box.number}`}
                  />
                  <span className="text-xs text-[#5C6560]">Печатать</span>
                </div>
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="print-color-adjust inline-block rounded-md bg-[#1D2923] px-2 py-1 font-mono text-base font-extrabold text-[#F4F1E9]">
                      № {box.number}
                    </p>
                    <p
                      className="mt-3 text-sm font-extrabold uppercase"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {box.room}
                    </p>
                    <p
                      className="mt-1 text-xs text-[#5C6560]"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {box.title}
                    </p>
                    {box.fragile && (
                      <p className="mt-2 text-xs font-extrabold text-[#A84D3C]">
                        Хрупкое
                      </p>
                    )}
                  </div>
                  {url && <Qr value={url} size={88} />}
                </div>
                <div className="print-label-contents no-print mt-5 min-w-0 rounded-[10px] bg-[#EDF1E8] p-3 text-xs leading-5 text-[#4E5752]">
                  <strong>Содержимое:</strong>
                  {box.itemNames.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {box.itemNames.map((name, index) => (
                        <span
                          key={`${box.id}:${index}`}
                          className="inline-flex min-w-0 max-w-full rounded-md bg-[#DDE7D6] px-2 py-1 font-medium text-[#1D2923]"
                        >
                          <span
                            className="block min-w-0 max-w-full"
                            style={{ overflowWrap: "anywhere" }}
                          >
                            {name}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1">Заполняется</p>
                  )}
                </div>
                <Button
                  variant="link"
                  onClick={() => onSelect(box.id)}
                  className="no-print mt-4 h-auto p-0 text-xs font-bold text-[#42664D]"
                >
                  Открыть коробку
                </Button>
              </article>
            );
          })
        ) : (
          <div className="col-span-full rounded-lg bg-white p-12 text-center text-sm text-[#5C6560]">
            Сначала добавьте коробки.
          </div>
        )}
      </section>
    </>
  );
}
