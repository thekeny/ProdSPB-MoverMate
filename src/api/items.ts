import { scanItems as scanItemsApi } from "@/api/generated";
import { unwrap } from "@/api/request";
import { ITEM_SCAN } from "@/configs/consts/item-scan.const";

export function scanItems(projectId: string, image: Blob) {
  return unwrap(
    scanItemsApi({
      path: { project_id: projectId },
      body: image,
      headers: { "Content-Type": image.type },
      timeout: ITEM_SCAN.TIMEOUT,
    }),
  );
}
