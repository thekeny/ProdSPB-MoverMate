import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Qr } from "@/components/box/qr";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeading } from "@/components/ui/page-heading";
import type { Project } from "@/configs/types/project.type";
import { boxLink } from "@/lib/box-link";

export function LabelsView({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>(
    project.boxes.map((box) => box.id),
  );
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const allSelected =
    project.boxes.length > 0 &&
    project.boxes.every((box) => selected.includes(box.id));
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
      {project.boxes.length > 0 && (
        <div className="no-print mb-4 flex items-center gap-2 text-sm font-bold">
          <Checkbox
            aria-label="Выбрать все коробки"
            checked={allSelected}
            onCheckedChange={() =>
              setSelected(allSelected ? [] : project.boxes.map((box) => box.id))
            }
          />
          Выбрать все
        </div>
      )}
      <section className="print-labels grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {project.boxes.length ? (
          project.boxes.map((box) => {
            const contents = project.items.filter(
              (item) => item.boxId === box.id && item.state === "IN_BOX",
            );
            const url = origin ? boxLink(box.qrToken) : "";
            return (
              <article
                key={box.id}
                className={`print-color-adjust break-inside-avoid rounded-lg bg-white p-5 ${selected.includes(box.id) ? "" : "print:hidden"}`}
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
                  <span className="text-xs text-[#68716C]">Печатать</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="print-color-adjust inline-block rounded-md bg-[#1D2923] px-2 py-1 font-mono text-base font-extrabold text-[#F4F1E9]">
                      № {box.number}
                    </p>
                    <p className="mt-3 text-sm font-extrabold uppercase">
                      {box.room}
                    </p>
                    <p className="mt-1 text-xs text-[#68716C]">{box.title}</p>
                    {box.fragile && (
                      <p className="mt-2 text-xs font-extrabold text-[#A84D3C]">
                        Хрупкое
                      </p>
                    )}
                  </div>
                  {url && <Qr value={url} size={88} />}
                </div>
                <div className="mt-5 rounded-[10px] bg-[#EDF1E8] p-3 text-xs leading-5 text-[#4E5752]">
                  <strong>Содержимое:</strong>
                  {contents.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {contents.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex rounded-md bg-[#DDE7D6] px-2 py-1 font-medium text-[#1D2923]"
                        >
                          {item.name}
                          {item.quantity > 1 ? ` · ${item.quantity} шт.` : ""}
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
          <div className="col-span-full rounded-lg bg-white p-12 text-center text-sm text-[#68716C]">
            Сначала добавьте коробки.
          </div>
        )}
      </section>
    </>
  );
}
