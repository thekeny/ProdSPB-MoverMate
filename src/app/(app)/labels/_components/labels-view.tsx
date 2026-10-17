import { Printer } from "lucide-react";
import { Qr } from "@/components/box/qr";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";
import type { Project } from "@/configs/types/project.type";

function boxQrValue(
  strategy: Project["qrCodeStrategy"],
  boxId: string,
  salt: string,
) {
  const url = new URL(pages.BOX, window.location.origin);
  url.searchParams.set(QUERY_PARAMS.BOX_ID, boxId);
  if (strategy === "protected")
    url.searchParams.set(QUERY_PARAMS.BOX_KEY, salt);
  return url.toString();
}

export function LabelsView({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="Маркировка"
        title="Этикетки с QR-кодами"
        description="Распечатайте и наклейте на коробки. QR-код открывает содержимое коробки."
        action={
          <Button onClick={() => window.print()} className="no-print h-11">
            <Printer />
            Печать / PDF
          </Button>
        }
      />
      <section className="print-labels grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {project.boxes.length ? (
          project.boxes.map((box) => (
            <article
              key={box.id}
              className="print-color-adjust break-inside-avoid rounded-lg bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="print-color-adjust inline-block rounded-md bg-[#1D2923] px-2 py-1 font-mono text-base font-extrabold text-[#F4F1E9]">
                    {box.id}
                  </p>
                  <p className="mt-3 text-sm font-extrabold uppercase">
                    {box.room}
                  </p>
                  <p className="mt-1 text-xs text-[#68716C]">{box.title}</p>
                </div>
                <div className="grid justify-items-end gap-1">
                  <Qr
                    value={boxQrValue(project.qrCodeStrategy, box.id, box.salt)}
                    size={88}
                  />
                </div>
              </div>
              <p className="mt-5 rounded-[8px] bg-[#EDF1E8] p-3 text-xs leading-5 text-[#4E5752]">
                <strong>Содержимое:</strong>{" "}
                {box.items.length
                  ? box.items.map((item) => item.name).join(", ")
                  : "Заполняется"}
              </p>
              <Button
                variant="link"
                onClick={() => onSelect(box.id)}
                className="no-print mt-4 h-auto p-0 text-xs font-bold text-[#42664D] hover:text-[#1D2923]"
              >
                Открыть коробку
              </Button>
            </article>
          ))
        ) : (
          <div className="col-span-full rounded-lg bg-white p-12 text-center text-sm text-[#68716C]">
            Сначала добавьте коробки — этикетки появятся здесь.
          </div>
        )}
      </section>
    </>
  );
}
