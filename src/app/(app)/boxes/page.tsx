"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { searchItems } from "@/api/generated";
import { mapItem } from "@/api/project-data";
import { unwrap } from "@/api/request";
import { BoxForm } from "@/app/(app)/boxes/_components/box-form";
import { BoxesView } from "@/app/(app)/boxes/_components/boxes-view";
import { PackingList } from "@/app/(app)/boxes/_components/packing-list";
import { BoxDetails } from "@/components/box/box-details";
import { BoxTips } from "@/components/box/box-tips";
import { ApiQueryError } from "@/components/ui/api-query-error";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/configs/consts/api.const";
import { SEARCH_PAGE_SIZE } from "@/configs/consts/lists.const";
import { roomIcon } from "@/configs/consts/rooms.const";
import { statuses } from "@/configs/consts/statuses.const";
import { pages } from "@/configs/paths/pages.path";
import { QUERY_PARAMS } from "@/configs/paths/query.path";
import type { Status } from "@/configs/types/box.type";
import { matchesWordPrefixes } from "@/lib/item-search";
import { useDebounce } from "@/lib/use-debounce";
import { useProjects } from "@/providers/projects-provider";

export default function BoxesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { project, addBox, updateProject, changeBoxStatus, canEdit } =
    useProjects();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [selectedBox, setSelectedBox] = useState<string | null>(
    searchParams.get(QUERY_PARAMS.BOX_ID),
  );
  const [showForm, setShowForm] = useState(false);
  const [searchInput, setSearchInput] = useState<HTMLElement | null>(null);
  const projectId = project?.id;
  const query = debouncedSearch.trim();
  const itemSearch = useInfiniteQuery({
    queryKey: QUERY_KEYS.ITEM_SEARCH(projectId ?? "", query),
    enabled: Boolean(projectId && query && canEdit),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      unwrap(
        searchItems({
          path: { project_id: projectId as string },
          query: { q: query, limit: SEARCH_PAGE_SIZE, offset: pageParam },
        }),
      ),
    getNextPageParam: (lastPage, _pages, offset) =>
      lastPage.has_more ? offset + SEARCH_PAGE_SIZE : undefined,
  });
  const boxesById = useMemo(
    () => new Map(project?.boxes.map((box) => [box.id, box]) ?? []),
    [project?.boxes],
  );
  useEffect(() => {
    if (!projectId) return;
    setSelectedBox(searchParams.get(QUERY_PARAMS.BOX_ID));
  }, [projectId, searchParams]);

  useEffect(() => {
    if (!projectId) return;
    if (searchParams.get(QUERY_PARAMS.NEW) && canEdit) {
      setShowForm(true);
      router.replace(pages.BOXES, { scroll: false });
    } else if (searchParams.get(QUERY_PARAMS.FIND) && searchInput) {
      searchInput.focus();
      router.replace(pages.BOXES, { scroll: false });
    }
  }, [projectId, searchParams, searchInput, router, canEdit]);

  if (!project) return null;
  const currentProject = project;
  const searchResults = canEdit
    ? (itemSearch.data?.pages.flatMap((page) => page.results.map(mapItem)) ??
      [])
    : currentProject.items.filter((item) =>
        matchesWordPrefixes(item.name, query),
      );
  const itemResults = searchResults.filter(
    (item) =>
      roomFilter === "all" ||
      (item.boxId && boxesById.get(item.boxId)?.room === roomFilter),
  );
  const matchingBoxIds = new Set(itemResults.map((item) => item.boxId));
  const boxes = currentProject.boxes.filter(
    (box) =>
      (roomFilter === "all" || box.room === roomFilter) &&
      (!debouncedSearch.trim() ||
        (debouncedSearch.trim().split(/\s+/u).length === 1 &&
          /^\d+$/.test(debouncedSearch.trim()) &&
          box.number === Number(debouncedSearch.trim())) ||
        matchingBoxIds.has(box.id) ||
        matchesWordPrefixes(`${box.title} ${box.room}`, query)),
  );
  const box = currentProject.boxes.find((item) => item.id === selectedBox);
  return (
    <>
      {itemSearch.isError && canEdit && (
        <div>
          <ApiQueryError error={itemSearch.error} />
          <Button variant="outline" onClick={() => void itemSearch.refetch()}>
            Повторить поиск
          </Button>
        </div>
      )}
      <BoxesView
        key={`boxes-${project.id}`}
        boxes={boxes}
        allBoxes={currentProject.boxes}
        items={currentProject.items}
        itemResults={itemResults}
        searching={
          canEdit &&
          Boolean(search.trim()) &&
          (itemSearch.isPending || search.trim() !== query)
        }
        hasMoreResults={canEdit && Boolean(itemSearch.hasNextPage)}
        loadingMore={itemSearch.isFetchingNextPage}
        onMoreResults={() => void itemSearch.fetchNextPage()}
        rooms={currentProject.destinationRooms}
        totalCount={currentProject.boxes.length}
        canEdit={canEdit}
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
      <PackingList
        key={`packing-${project.id}`}
        project={currentProject}
        updateProject={updateProject}
        canEdit={canEdit}
      />
      <BoxTips />
      {showForm && canEdit && (
        <BoxForm
          projectId={project.id}
          destinationRooms={project.destinationRooms}
          sourceRooms={project.sourceRooms}
          lastSourceRoom={project.lastSourceRoom}
          onClose={() => setShowForm(false)}
          onSubmit={addBox}
        />
      )}
      {box && (
        <BoxDetails
          box={box}
          project={currentProject}
          canEdit={canEdit}
          onClose={() => {
            setSelectedBox(null);
            router.replace(pages.BOXES, { scroll: false });
          }}
          updateProject={updateProject}
          changeBoxStatus={changeBoxStatus}
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
