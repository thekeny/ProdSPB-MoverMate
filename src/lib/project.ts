import type { Project } from "@/configs/types/project.type";
import { uid } from "@/lib/id";

export function createEmptyProject(
  values: Pick<Project, "name" | "date" | "from" | "to">,
): Project {
  return {
    id: uid("project"),
    ...values,
    qrCodeStrategy: "protected",
    boxes: [],
    tasks: [],
    firstDay: [
      { id: uid("first"), title: "Документы и ключи", done: false },
      { id: uid("first"), title: "Зарядки и пауэрбанк", done: false },
      { id: uid("first"), title: "Аптечка", done: false },
    ],
    roomsLoaded: {
      Кухня: false,
      Кабинет: false,
      Спальня: false,
      Гостиная: false,
    },
  };
}
