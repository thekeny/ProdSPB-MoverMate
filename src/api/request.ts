import type { ErrorResponse } from "@/api/generated/types.gen";
import { markConnected, markDisconnected } from "@/lib/connectivity";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;

  constructor(status: number, body: Partial<ErrorResponse> | undefined) {
    const error = body?.error;
    super(error?.message ?? `HTTP ${status}`);
    this.status = status;
    this.code = error?.code ?? "unknown";
    this.fields = Object.fromEntries(
      (error?.details ?? [])
        .filter((detail) => detail.field)
        .map((detail) => [detail.field as string, detail.message]),
    );
  }
}

type Result<T> = {
  data?: T;
  error?: unknown;
  response?: Response;
};

function asErrorBody(error: unknown): Partial<ErrorResponse> | undefined {
  if (!error || typeof error !== "object") return undefined;
  const body = Array.isArray(error) ? error[0] : error;
  if (!body || typeof body !== "object") return undefined;
  return body as Partial<ErrorResponse>;
}

export async function unwrap<T>(request: Promise<Result<T>>): Promise<T> {
  let result: Result<T>;
  try {
    result = await request;
  } catch {
    markDisconnected();
    throw new ApiError(0, undefined);
  }
  const { data, error, response } = result;
  if (response) markConnected();
  else markDisconnected();
  if (error !== undefined || !response?.ok)
    throw new ApiError(response?.status ?? 0, asErrorBody(error));
  return data as T;
}
