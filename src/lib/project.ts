import { ROOM_PRESETS } from "@/configs/consts/rooms.const";
import type { Project } from "@/configs/types/project.type";
import { uid } from "@/lib/id";

export function createEmptyProject(
  values: Pick<Project, "name" | "date" | "from" | "to" | "ownerId"> &
    Partial<Pick<Project, "sourceRooms" | "destinationRooms" | "members">>,
): Project {
  return {
    id: uid("project"),
    ...values,
    qrCodeStrategy: "protected",
    sourceRooms: values.sourceRooms ?? [...ROOM_PRESETS],
    lastSourceRoom: values.sourceRooms?.[0] ?? ROOM_PRESETS[0],
    destinationRooms: values.destinationRooms ?? [...ROOM_PRESETS],
    members: values.members ?? [],
    boxes: [],
    nextBoxNumber: 1,
    items: [],
    tasks: [],
  };
}
