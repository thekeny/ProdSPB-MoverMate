"use client";

import { Box } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BoxForm } from "@/app/(app)/boxes/_components/box-form";
import { BoxesView } from "@/app/(app)/boxes/_components/boxes-view";
import { BoxDetails } from "@/components/box/box-details";
import { rooms } from "@/configs/consts/rooms.const";
import { statuses } from "@/configs/consts/statuses.const";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";
import type { Status } from "@/configs/types/box.type";
import type { Room } from "@/configs/types/room.type";
import { useProjects } from "@/providers/projects-provider";

export default function BoxesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { project, addBox, updateProject } = useProjects();
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState<Room | "all">("all");
  const [selectedBox, setSelectedBox] = useState<string | null>(
    searchParams.get(QUERY_PARAMS.BOX_ID),
  );
  const [showForm, setShowForm] = useState(false);
  const [searchInput, setSearchInput] = useState<HTMLElement | null>(null);
  const projectId = project?.id;

  useEffect(() => {
    if (!projectId) return;
    setSelectedBox(searchParams.get(QUERY_PARAMS.BOX_ID));
  }, [projectId, searchParams]);

  useEffect(() => {
    if (!projectId) return;
    if (searchParams.get(QUERY_PARAMS.NEW)) {
      setShowForm(true);
      router.replace(pages.BOXES, { scroll: false });
    } else if (searchParams.get(QUERY_PARAMS.FIND) && searchInput) {
      searchInput.focus();
      router.replace(pages.BOXES, { scroll: false });
    }
  }, [projectId, searchParams, searchInput, router]);

  if (!project) return null;
  const currentProject = project;
  const boxes = currentProject.boxes.filter(
    (box) =>
      (roomFilter === "all" || box.room === roomFilter) &&
      `${box.id} ${box.title} ${box.room} ${box.items.map((item) => item.name).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const box = currentProject.boxes.find((item) => item.id === selectedBox);
  const updateBox = (
    apply: (
      value: (typeof currentProject.boxes)[number],
    ) => (typeof currentProject.boxes)[number],
  ) =>
    updateProject((current) => ({
      ...current,
      boxes: current.boxes.map((item) =>
        item.id === selectedBox ? apply(item) : item,
      ),
    }));
  return (
    <>
      <BoxesView
        boxes={boxes}
        totalCount={currentProject.boxes.length}
        search={search}
        setSearch={setSearch}
        searchRef={setSearchInput}
        roomFilter={roomFilter}
        setRoomFilter={setRoomFilter}
        roomIcon={(name) =>
          rooms.find((room) => room.name === name)?.Icon ?? Box
        }
        status={(key: Status) =>
          statuses.find((item) => item.key === key) ?? statuses[0]
        }
        onAdd={() => setShowForm(true)}
        onSelect={(id) => {
          setSelectedBox(id);
          router.replace(`${pages.BOXES}?${QUERY_PARAMS.BOX_ID}=${id}`, {
            scroll: false,
          });
        }}
        onDeselect={() => {
          setSelectedBox(null);
          router.replace(pages.BOXES, { scroll: false });
        }}
        onResetFilters={() => {
          setSearch("");
          setRoomFilter("all");
        }}
      />
      {showForm && (
        <BoxForm
          onClose={() => setShowForm(false)}
          onSubmit={(event) => {
            addBox(event);
            setShowForm(false);
          }}
        />
      )}
      {box && (
        <BoxDetails
          box={box}
          onClose={() => {
            setSelectedBox(null);
            router.replace(pages.BOXES, { scroll: false });
          }}
          update={updateBox}
          onDelete={() => {
            updateProject((current) => ({
              ...current,
              boxes: current.boxes.filter((item) => item.id !== selectedBox),
            }));
            setSelectedBox(null);
            router.replace(pages.BOXES, { scroll: false });
          }}
        />
      )}
    </>
  );
}
