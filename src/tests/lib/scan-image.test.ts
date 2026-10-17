import { describe, expect, it } from "vitest";
import { ApiError } from "@/api/request";
import {
  isScanReady,
  prepareScanImage,
  ScanImageError,
  scanErrorMessage,
} from "@/lib/scan-image";

describe("isScanReady", () => {
  it("accepts supported images up to 5 MB", () => {
    expect(isScanReady(new Blob(["x"], { type: "image/jpeg" }))).toBe(true);
    expect(
      isScanReady(new Blob([new Uint8Array(5_242_881)], { type: "image/png" })),
    ).toBe(false);
    expect(isScanReady(new Blob(["x"], { type: "image/heic" }))).toBe(false);
  });
});

describe("prepareScanImage", () => {
  it("returns a ready image unchanged", async () => {
    const file = new File(["x"], "photo.webp", { type: "image/webp" });
    await expect(prepareScanImage(file)).resolves.toBe(file);
  });

  it("rejects an image the browser cannot decode", async () => {
    const file = new File(["x"], "photo.heic", { type: "image/heic" });
    const error = await prepareScanImage(file).catch((reason) => reason);
    expect(error).toBeInstanceOf(ScanImageError);
    expect(error.reason).toBe("unreadable");
  });
});

describe("scanErrorMessage", () => {
  it("explains image and scanner failures", () => {
    expect(scanErrorMessage(new ScanImageError("too_large"))).toContain("5 МБ");
    expect(scanErrorMessage(new ApiError(415, undefined))).toContain("JPEG");
    expect(scanErrorMessage(new ApiError(503, undefined))).toContain(
      "недоступно",
    );
    expect(scanErrorMessage(new ApiError(429, undefined))).toBe(
      "Слишком много попыток. Подождите немного.",
    );
  });
});
