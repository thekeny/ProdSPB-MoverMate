import { ROOM_PRESETS } from "@/configs/consts/rooms.const";
import type { ProjectLocalData } from "@/configs/types/project.type";

export function parseRoomList(value: string | string[]) {
  const rooms = (Array.isArray(value) ? value : value.split(/[;,\n]/u))
    .map((room) => room.trim())
    .filter(Boolean);
  return rooms.length ? [...new Set(rooms)] : [...ROOM_PRESETS];
}

export function createProjectLocalData(
  rooms: { source: string[]; destination: string[] } = {
    source: [...ROOM_PRESETS],
    destination: [...ROOM_PRESETS],
  },
): ProjectLocalData {
  return {
    sourceRooms: rooms.source,
    lastSourceRoom: rooms.source[0] ?? ROOM_PRESETS[0],
    destinationRooms: rooms.destination,
    boxes: [],
    nextBoxNumber: 1,
    items: [],
    tasks: [],
  };
}

export function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}
