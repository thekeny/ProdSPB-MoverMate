import { describe, expect, it } from "vitest";
import { ApiError, unwrap } from "@/api/request";
import { apiErrorMessage } from "@/lib/api-error";

describe("unwrap", () => {
  it("возвращает data при успешном ответе", async () => {
    const data = await unwrap(
      Promise.resolve({ data: { id: 1 }, response: new Response("{}") }),
    );
    expect(data).toEqual({ id: 1 });
  });

  it("разворачивает ошибку, которую бэкенд отдаёт массивом", async () => {
    const error = (await unwrap(
      Promise.resolve({
        error: [
          {
            error: {
              code: "username_taken",
              message: "taken",
              details: [],
            },
          },
        ],
        response: new Response("{}", { status: 409 }),
      }),
    ).catch((reason: unknown) => reason)) as ApiError;
    expect(error.code).toBe("username_taken");
    expect(apiErrorMessage(error)).toBe("Это имя уже занято.");
  });

  it("превращает ошибку бэкенда в ApiError с кодом и полями", async () => {
    const error = (await unwrap(
      Promise.resolve({
        error: {
          error: {
            code: "invalid_username",
            message: "bad",
            details: [{ field: "body.username", message: "short" }],
          },
        },
        response: new Response("{}", { status: 422 }),
      }),
    ).catch((reason: unknown) => reason)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.code).toBe("invalid_username");
    expect(error.fields).toEqual({ "body.username": "short" });
  });

  it("сетевой сбой даёт ApiError со статусом 0", async () => {
    const error = (await unwrap(Promise.reject(new Error("offline"))).catch(
      (reason: unknown) => reason,
    )) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
  });
});

describe("apiErrorMessage", () => {
  it("подбирает текст по коду, затем по статусу", () => {
    expect(
      apiErrorMessage(
        new ApiError(409, { error: { code: "username_taken", message: "x" } }),
      ),
    ).toBe("Это имя уже занято.");
    expect(apiErrorMessage(new ApiError(429, undefined))).toContain(
      "Слишком много",
    );
    expect(apiErrorMessage(new ApiError(503, undefined))).toContain(
      "недоступен",
    );
    expect(apiErrorMessage(new Error("x"))).toContain("Нет связи");
  });
});
