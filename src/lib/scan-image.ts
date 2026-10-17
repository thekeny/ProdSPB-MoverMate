import { ApiError } from "@/api/request";
import { ITEM_SCAN } from "@/configs/consts/item-scan.const";
import { apiErrorMessage } from "@/lib/api-error";

export class ScanImageError extends Error {
  constructor(readonly reason: "unreadable" | "too_large") {
    super(reason);
  }
}

export function isScanReady(image: Blob) {
  return (
    ITEM_SCAN.IMAGE_TYPES.includes(image.type) &&
    image.size <= ITEM_SCAN.MAX_BYTES
  );
}

export async function prepareScanImage(file: Blob): Promise<Blob> {
  if (isScanReady(file)) return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ScanImageError("unreadable");
  }
  const scale = Math.min(
    1,
    ITEM_SCAN.RESIZE_MAX_SIDE / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const image = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, ITEM_SCAN.RESIZE_TYPE, ITEM_SCAN.RESIZE_QUALITY),
  );
  if (!image || !isScanReady(image)) throw new ScanImageError("too_large");
  return image;
}

export function scanErrorMessage(error: unknown) {
  if (error instanceof ScanImageError)
    return error.reason === "too_large"
      ? "Фото слишком большое. Выберите изображение до 5 МБ."
      : "Не удалось открыть фото. Выберите JPEG, PNG, WebP или GIF.";
  if (error instanceof ApiError) {
    if (error.status === 413)
      return "Фото слишком большое. Выберите изображение до 5 МБ.";
    if (error.status === 415)
      return "Формат фото не поддерживается. Выберите JPEG, PNG, WebP или GIF.";
    if (error.status === 503)
      return "Распознавание сейчас недоступно. Попробуйте чуть позже.";
  }
  return apiErrorMessage(error);
}
