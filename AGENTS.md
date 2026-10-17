# Project Guidelines

## Stack
- Next.js (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4, Base UI / Shadcn, Biome (linter & formatter), Ky (HTTP client), TanStack Query (server state)

## Structure
- `src/app/` — routes. Route groups: `(auth)/` (login, projects selection, no shell) and `(app)/` (private pages; `(app)/layout.tsx` is the auth/project guard and renders `AppShell`). Group names never appear in URLs
- Page-specific code lives next to its route: `src/app/<group>/<route>/page.tsx` is the client page itself; its private components go into `_components/` in the same route folder (no `*-page-client` wrappers)
- `src/components/ui/` — reusable primitives (`field`, `text-input`, `select`, `modal`, `page-heading`, shadcn `button`/`checkbox`/`dropdown-menu`); `select`, `checkbox`, `text-input` wrap Base UI primitives (`@base-ui/react/select|checkbox|input`) with Tailwind styling. Do not use native `<select>`, `<option>`, `<input type="checkbox">`, or `<button>`; use these components instead
- Option lists for selects live in `src/configs/consts/` (`rooms.const`, `task-stages.const`, `qr-strategies.const`)
- `src/components/layout/` — app shell pieces (`app-shell`, `sidebar`, `mobile-nav`, `mobile-header`, `user-card`, `project-switcher`, `project-settings-modal`, `logo`, `loading-screen`)
- `src/components/box/` — box components shared by several pages (`box-details`, `qr`)
- `src/providers/` — `query-provider`, `auth-provider` (`useAuth`), `projects-provider` (`useProjects`, local per-account project state)
- `src/configs/` — single source of truth: routes and URLs (`paths/`: `pages`, `images`, `query` params), constants (`consts/`), and domain/config types (`types/`); components import from here, never hardcode paths, query keys, or domain types
- `src/api/generated/` — auto-generated Hey API SDK + types from the backend OpenAPI spec (never edit by hand; regenerate with `npm run openapi`)
- `src/api/hey-api.ts` — runtime config for the generated Ky client (relative baseUrl, bearer `auth` callback, timeout, retries)
- `src/api/session.ts` — access/refresh token storage (localStorage), single-flight refresh via Web Locks; `src/api/request.ts` — `unwrap()` + `ApiError` (`{error: {code, message, details}}`); `src/lib/api-error.ts` — error code to Russian message
- The browser calls the backend through the Next rewrite `/api/v1/*` to `${NEXT_PUBLIC_API_URL}/api/v1/*` (`next.config.ts`), because the backend CORS allows only its own origin
- `openapi-ts.config.ts` — Hey API generator config (spec input, output path, plugins)
- `src/lib/` — utilities: `id` (uid), `format` (dates, plural), `project` (project factory), `project-storage` (normalization), `api-error`, `utils` (`cn`)
- `src/tests/` — Vitest tests (mirror the `src/` structure, e.g. `src/tests/lib/utils.test.ts`); run with `npm test`
- `.gitlab-ci.yml` — CI/CD (check → build → deploy); Spirit templates vendored from `pipelines/pipelines` into `.gitlab/ci/`
- `Dockerfile` + `docker-compose.prod.yml` — runtime-only image that packages a prebuilt standalone Next.js app (`output: "standalone"`, run `npm run build` before `docker build`; never build inside Kaniko, it runs out of memory) and the prod stack deployed to `$DEPLOY_DIR/frontend`; keep the node image in sync between `Dockerfile` and `.gitlab-ci.yml`

## Rules for Agents
- Keep code clean: avoid redundant, explanatory, or trivial comments unless strictly necessary.
- Maintain consistent coding style and project conventions.
- Keep `src/configs/` as the single source of truth for URLs, route paths, and static constants.
- Do not create catch-all modules (`movermate.*`, `utils` dumps). Split by concept: one const/type/lib file per domain concept.
- Update this `AGENTS.md` file whenever adding architectural decisions, new tooling, or project conventions.
- Create design with rules from `DESIGN.md`

## Skills
- Use `ui-ux-pro-max` for UI/UX direction, design-system choices, responsive behavior, accessibility, and UX review.
- Use `frontend-design` when building or redesigning production frontend pages, flows, or components.
- Use `design-taste-frontend` when a page needs a distinctive visual concept, especially landing pages and portfolios.
- Use `make-interfaces-feel-better` to review and polish interaction details, typography, spacing, motion, and visual finish.
- Use `browser-automation` for browser-based navigation, interaction, and verification workflows.
- Use `diagnosing-bugs` for hard, intermittent, or unclear bugs; establish a reproducible feedback loop before changing code.

## Backend status
- The backend currently exposes only health, `/api/v1/auth/*` and `/api/v1/users/me*`. Auth is real; projects, rooms, boxes, items, tasks, members, labels and search are still local (`localStorage`, keyed by user id) until the endpoints from `frontend-backend-alignment.md` section 2 appear in `/openapi.json`. Then run `npm run openapi` and migrate each area.
- There is no `middleware.ts`: tokens live in localStorage, so route guarding stays client-side (`src/app/(app)/layout.tsx`). Revisit if the backend moves refresh to an httpOnly cookie.
