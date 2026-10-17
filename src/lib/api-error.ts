import { ApiError } from "@/api/request";

const MESSAGES: Record<string, string> = {
  invalid_username: "Имя пользователя: от 3 до 32 символов.",
  invalid_password: "Пароль: от 8 до 128 символов.",
  invalid_credentials: "Неверное имя пользователя или пароль.",
  username_taken: "Это имя уже занято.",
  not_authenticated: "Сессия истекла. Войдите снова.",
  invalid_refresh_token: "Сессия истекла. Войдите снова.",
};

const STATUS_MESSAGES: Record<number, string> = {
  0: "Нет связи с сервером. Проверьте подключение.",
  422: "Проверьте введённые данные.",
  429: "Слишком много попыток. Подождите немного.",
};

export function apiErrorMessage(error: unknown) {
  if (error instanceof ApiError)
    return (
      MESSAGES[error.code] ??
      STATUS_MESSAGES[error.status] ??
      (error.status >= 500
        ? "Сервер недоступен. Попробуйте позже."
        : "Что-то пошло не так. Попробуйте ещё раз.")
    );
  return STATUS_MESSAGES[0];
}
