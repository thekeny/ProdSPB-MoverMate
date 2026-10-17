"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BoxForm } from "@/app/(app)/boxes/_components/box-form";
import { BoxesView } from "@/app/(app)/boxes/_components/boxes-view";
import { PackingList } from "@/app/(app)/boxes/_components/packing-list";
import { BoxDetails } from "@/components/box/box-details";
import { roomIcon } from "@/configs/consts/rooms.const";
import { statuses } from "@/configs/consts/statuses.const";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";
import type { Status } from "@/configs/types/box.type";
import { useProjects } from "@/providers/projects-provider";

export default function BoxesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { project, addBox, updateProject } = useProjects();
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState<string>("all");
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
  const queryWords =
    search.toLocaleLowerCase("ru").match(/[\p{L}\p{N}]+/gu) ?? [];
  const startsWithQuery = (value: string) => {
    const words = value.toLocaleLowerCase("ru").match(/[\p{L}\p{N}]+/gu) ?? [];
    return queryWords.every((queryWord) =>
      words.some((word) => word.startsWith(queryWord)),
    );
  };
  const itemStateLabel = (item: (typeof currentProject.items)[number]) =>
    item.state === "LOST"
      ? "Потеряна"
      : item.state === "TAKEN_OUT"
        ? "На месте"
        : item.state === "TO_PACK"
          ? "Нужно упаковать"
          : "В коробке";
  const itemResults =
    search.trim() && queryWords.length
      ? currentProject.items.filter((item) => {
          if (item.boxId) {
            const box = currentProject.boxes.find(
              (entry) => entry.id === item.boxId,
            );
            if (roomFilter !== "all" && box?.room !== roomFilter) return false;
            return startsWithQuery(
              [
                item.name,
                item.sourceRoom,
                box?.title ?? "",
                box?.room ?? "",
                box
                  ? (statuses.find((status) => status.key === box.status)
                      ?.label ?? "")
                  : "",
              ].join(" "),
            );
          }
          return (
            roomFilter === "all" &&
            startsWithQuery(
              `${item.name} ${item.sourceRoom} ${itemStateLabel(item)}`,
            )
          );
        })
      : [];
  const boxes = currentProject.boxes.filter(
    (box) =>
      (roomFilter === "all" || box.room === roomFilter) &&
      (!search.trim() ||
        (queryWords.length === 1 &&
          /^\d+$/.test(search.trim()) &&
          box.number === Number(search.trim())) ||
        (queryWords.length > 0 &&
          startsWithQuery(
            `${box.title} ${box.room} ${currentProject.items
              .filter((item) => item.boxId === box.id)
              .map((item) => item.name)
              .join(" ")}`,
          ))),
  );
  const box = currentProject.boxes.find((item) => item.id === selectedBox);
  return (
    <>
      <BoxesView
        boxes={boxes}
        allBoxes={currentProject.boxes}
        items={currentProject.items}
        itemResults={itemResults}
        rooms={currentProject.destinationRooms}
        totalCount={currentProject.boxes.length}
        search={search}
        setSearch={setSearch}
        searchRef={setSearchInput}
        roomFilter={roomFilter}
        setRoomFilter={setRoomFilter}
        roomIcon={roomIcon}
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
      <PackingList project={currentProject} updateProject={updateProject} />
      {showForm && (
        <BoxForm
          projectId={project.id}
          destinationRooms={project.destinationRooms}
          sourceRooms={project.sourceRooms}
          lastSourceRoom={project.lastSourceRoom}
          onClose={() => setShowForm(false)}
          onSubmit={(values) => {
            addBox(values);
            setShowForm(false);
          }}
        />
      )}
      {box && (
        <BoxDetails
          box={box}
          project={currentProject}
          onClose={() => {
            setSelectedBox(null);
            router.replace(pages.BOXES, { scroll: false });
          }}
          updateProject={updateProject}
          onDelete={() => {
            updateProject((current) => ({
              ...current,
              boxes: current.boxes.filter((item) => item.id !== selectedBox),
              items: current.items.filter((item) => item.boxId !== selectedBox),
            }));
            setSelectedBox(null);
            router.replace(pages.BOXES, { scroll: false });
          }}
        />
      )}
    </>
  );
}
