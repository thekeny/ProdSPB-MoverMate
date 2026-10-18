# MoverMate

![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=reactquery&logoColor=white)
![Base UI](https://img.shields.io/badge/Base_UI-1.8-000000)
![Biome](https://img.shields.io/badge/Biome-2.2-60A5FA?logo=biome&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)

Веб-приложение для планирования переезда: проекты, комнаты, коробки, вещи и задачи.

6 место на хаке (фронт 9/10 баллов)

## Быстрый старт

```sh
npm i
npm run dev
```

Перед запуском задайте `NEXT_PUBLIC_API_URL` в `.env` — адрес backend без завершающего `/api/v1`. Браузер обращается к API через Next.js rewrite. Без backend можно запускать тесты и проверять интерфейс с подменёнными ответами API.

---

## Структура проекта

```text
src/
├── api/                  # HTTP-слой
│   ├── hey-api.ts        # конфиг сгенерированного клиента (baseUrl, таймаут, ретраи)
│   └── generated/        # автогенерированный SDK (не редактировать вручную)
├── app/             # App Router (страницы, layout, роутинг)
├── components/      # React-компоненты
│   ├── ui/          # Базовые UI-компоненты (кнопки, инпуты и т.д.)
│   ├── layout/      # Оболочка приложения и навигация
│   └── box/         # Общие компоненты коробок
├── providers/       # Авторизация, проекты, запросы, push
├── configs/         # Конфигурации, пути и константы
│   ├── paths/       # Пути страниц, ссылки, пути к изображениям
│   ├── consts/      # Константы (API URL и др.)
│   └── types/       # Общие типы конфигураций
└── lib/             # Вспомогательные утилиты (cn, форматтеры и т.д.)
```

### Описание основных директорий

- **`src/configs`** — единый источник правды для маршрутов, путей к изображениям, API URL и констант. Меняется в одном месте, без дублирования строк по приложению.
- **`src/components`** — общие компоненты; компоненты отдельных страниц лежат рядом с маршрутами в `_components/`.
- **`src/api`** — авторизация, проекты, комнаты, задачи, вещи и коробки используют backend. TanStack Query управляет серверными данными.
- **`src/providers`** — авторизация, выбор активного проекта, кеш запросов и регистрация push-подписки.
- **`src/lib`** — общие утилиты (`cn`, форматтеры и т.д.).

## Возможности

- Задачи по этапам, ответственные, выбор шаблонов и несколько напоминаний до срока.
- Коробки, инвентарь, статусы, напоминания о заполнении содержимого и распознавание вещей по фотографии.
- Серверный поиск с дозагрузкой результатов; без сети — поиск по началу слов в сохранённых данных.
- QR-этикетки с выбором коробок и печатью через браузер/PDF. `OPEN` разрешает просмотр без входа, `PROTECTED` — участникам проекта.
- Прогресс по комнатам, серверные подсказки для потерянных вещей и чек-лист первого дня с базовым набором.
- Офлайн-просмотр ранее загруженных проектов: кеш запросов в IndexedDB, маршруты и ресурсы в service worker. Изменения без сети отключены; выход очищает кеш аккаунта.

Для push нужен HTTPS либо localhost и разрешение пользователя. Напоминания отправляет backend; создание напоминания само по себе не подтверждает доставку. На iOS может потребоваться установка приложения на домашний экран.

Коробки, задачи, список упаковки и потеряшки показываются порциями. Данные активного проекта пока загружаются полностью для офлайн-просмотра и согласования изменений; проверка на большом проекте остаётся в [ToDo](docs/ToDo.md).

---

## Работа с API (автогенерированный SDK)

SDK генерируется из OpenAPI-спеки бэкенда через [Hey API](https://heyapi.dev/) на клиенте [`ky`](https://github.com/sindresorhus/ky). Пакет `@hey-api/client-ky` встроен в `@hey-api/openapi-ts`.

### Генерация

```sh
npm run openapi
```

Спека берётся из `${NEXT_PUBLIC_API_URL}/openapi.json` (переменная `NEXT_PUBLIC_API_URL` из `.env`). Сгенерированный код лежит в `src/api/generated/` и коммитится в репозиторий. **Не редактируйте его вручную** — изменения будут перезаписаны.

Конфиг генератора — `openapi-ts.config.ts`. Настройки клиента (baseUrl, таймаут, ретраи) — в `src/api/hey-api.ts`, они берутся из `src/configs/consts/api.const.ts`.

### Использование в компонентах

```ts
import { getUsers, createUser } from "@/api/generated";
import type { User } from "@/api/generated";

// GET
const { data } = await getUsers({ query: { page: 1 } });

// POST
const { data: created } = await createUser({ body: { name: "John" } });
```

Параметры группируются по типу (`path`, `query`, `body`, `header`). Типы описываются автоматически. Для интерактивных запросов удобно оборачивать функции в TanStack Query или вызывать из Server Actions / RSC.

---

## Тестирование (Vitest)

Тесты на [Vitest](https://vitest.dev/) с окружением `jsdom`. Все тесты — в `src/tests/`, структура повторяет `src/`.

```sh
npm test          # однократный прогон
npm run test:watch # режим наблюдения
```

---

## Полезные утилиты

- **Knip** — находит мёртвый код: неиспользуемые файлы, экспорты и лишние зависимости в `package.json`.
  ```sh
  npm run knip
  ```

- **Repomix** — упаковывает кодовую базу репозитория в единый файл для удобной передачи контекста в AI/LLM.
  ```sh
  npm run repomix
  ```
---

## CI/CD

Пайплайн `.gitlab-ci.yml`: `check` (lint · typecheck · test) → `build` → `deploy`. Шаблоны Spirit
(Kaniko, Teleport, авторизация в registry на VM) завендорены из `pipelines/pipelines` в `.gitlab/ci/`.

- **Любой push:** проверки; отчёт biome попадает в GitLab Code Quality.
- **MR и master:** `build:next` собирает приложение (`next build`, standalone) в обычной node-джобе, затем
  Kaniko только упаковывает готовый `.next/standalone` в образ: сборка внутри Kaniko не влезала по памяти.
  В MR образ не публикуется, на master Kaniko публикует `${DOCKER_ARTIFACTORY_REGISTRY}/<namespace>/<project>:<short-sha>`.
- **Deploy** (ручная кнопка на master): копирует `docker-compose.prod.yml` в `$DEPLOY_DIR/frontend`
  на VM и поднимает отдельный compose-проект `frontend` (порт `FRONTEND_PORT`, по умолчанию `3000`),
  затем smoke-тест `curl 127.0.0.1:$FRONTEND_PORT/`. Стек бэкенда на той же VM не затрагивается.
- **Откат:** перезапустить `deploy` в пайплайне последнего хорошего коммита.

Переменные CI (Settings → CI/CD → Variables):

| Переменная | Назначение |
|---|---|
| `SPIRIT_DOCKER_SA_KEY` | **File**, не protected: ключ сервисного аккаунта Spirit (registry, Teleport, токен для `docker pull` на VM) |
| `DOCKER_ARTIFACTORY_REGISTRY` | адрес registry Spirit |
| `DEPLOY_SSH_USER`, `DEPLOY_VM` | пользователь и имя VM в Teleport |
| `DEPLOY_DIR` | каталог стеков на VM; фронтенд живёт в `$DEPLOY_DIR/frontend` |
| `NEXT_PUBLIC_API_URL` | URL бэкенда: нужен при `npm run build` (адрес проксирования `/api/v1/*` в `next.config.ts`) и при `npm run openapi`; в клиентский код не попадает |
| `FRONTEND_PORT` | опционально: порт на VM, по умолчанию `3000` |

Локальная проверка образа:

```sh
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run build
docker build -t frontend .
docker run --rm -p 3000:3000 frontend
```
