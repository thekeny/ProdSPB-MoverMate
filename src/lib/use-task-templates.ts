import { useQuery } from "@tanstack/react-query";
import { listTaskTemplates } from "@/api/generated";
import { unwrap } from "@/api/request";
import { QUERY_KEYS } from "@/configs/consts/api.const";

export function useTaskTemplates() {
  return useQuery({
    queryKey: QUERY_KEYS.TASK_TEMPLATES,
    queryFn: () => unwrap(listTaskTemplates()),
  });
}
