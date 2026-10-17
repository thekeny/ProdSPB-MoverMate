import type { ErrorResponse } from "@/api/generated/types.gen";

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

export async function unwrap<T>(request: Promise<Result<T>>): Promise<T> {
  let result: Result<T>;
  try {
    result = await request;
  } catch {
    throw new ApiError(0, undefined);
  }
  const { data, error, response } = result;
  if (error !== undefined || !response?.ok)
    throw new ApiError(
      response?.status ?? 0,
      typeof error === "object" ? (error as Partial<ErrorResponse>) : undefined,
    );
  return data as T;
}
