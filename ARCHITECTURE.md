# Architecture — data & state layers

Clean separation between **server state** (TanStack Query) and **client state** (Zustand).

## Folder map

```
src/
├─ lib/
│  ├─ axios.ts          # global axios instance + interceptors (token, 401, error normalize)
│  ├─ http.ts           # typed helpers: http.get/post/put/patch/delete → returns response.data
│  ├─ query-client.ts   # QueryClient factory (SSR-safe singleton)
│  └─ query-keys.ts     # type-safe query-key factory (queryKeys.bookings.list(...), …)
├─ types/
│  └─ api.ts            # ApiResponse<T>, Paginated<T>, ApiError, ListParams, Id
├─ services/            # DATA LAYER — pure API functions, no React
│  ├─ bookings.service.ts   # example: list/getById/create/update/remove
│  └─ index.ts
├─ hooks/queries/       # TANSTACK LAYER — query/mutation hooks over services
│  └─ use-bookings.ts       # example: useBookings, useCreateBooking, …
└─ stores/              # CLIENT STATE — Zustand
   ├─ create-selectors.ts   # auto `.use.<field>()` selectors
   ├─ auth.store.ts         # session/token (read by axios interceptor)
   ├─ ui.store.ts           # active venue, command palette, …
   └─ index.ts
```

## The flow

```
component → query hook (hooks/queries) → service (services) → http (lib/http) → axios (lib/axios) → API
                  ↑ TanStack Query cache (server state)
component → zustand store (stores)  ← client-only UI/session state
```

## Add a new domain (e.g. `invoices`)

1. **Service** — `src/services/invoices.service.ts` exporting `invoicesService` (copy `bookings.service.ts`), re-export from `services/index.ts`.
2. **Query keys** — already scaffolded: `queryKeys.invoices.*`.
3. **Hooks** — `src/hooks/queries/use-invoices.ts` (copy `use-bookings.ts`).
4. Use the hooks in your feature components.

> Co-locating hooks inside `features/<domain>/` instead of `hooks/queries/` is equally valid — just pick one convention and stay consistent.

## Conventions

- **Never call axios from a component.** Component → hook → service → `http`.
- **Server data lives in TanStack Query**, client/UI/session data lives in Zustand.
- **Always use `queryKeys`** for cache keys + invalidation.
- The axios interceptor attaches `authStore.getToken()` and clears the session + redirects on `401`.
- Configure the API base URL via `NEXT_PUBLIC_API_BASE_URL` (see `.env.example`).
