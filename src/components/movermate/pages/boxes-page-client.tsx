"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BoxDetails } from "@/components/movermate/box-details";
import { BoxForm } from "@/components/movermate/forms";
import { BoxesView } from "@/components/movermate/pages/boxes-view";
import { useMoverMate } from "@/components/movermate/store";
import {
  Box,
  type Room,
  rooms,
  type Status,
  statuses,
} from "@/configs/consts/movermate.const";
import { pages } from "@/configs/paths/pages.path";

export function BoxesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { project, addBox, updateProject } = useMoverMate();
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState<Room | "all">("all");
  const [selectedBox, setSelectedBox] = useState<string | null>(
    searchParams.get("id"),
  );
  const [showForm, setShowForm] = useState(false);
  const [searchInput, setSearchInput] = useState<HTMLElement | null>(null);
  const projectId = project?.id;

  useEffect(() => {
    if (!projectId) return;
    setSelectedBox(searchParams.get("id"));
  }, [projectId, searchParams]);

  useEffect(() => {
    if (!projectId) return;
    if (searchParams.get("new")) {
      setShowForm(true);
      router.replace(pages.BOXES, { scroll: false });
    } else if (searchParams.get("find") && searchInput) {
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
          router.replace(`${pages.BOXES}?id=${id}`, { scroll: false });
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
