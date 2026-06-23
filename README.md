# BookLatch — Venue Management Platform (Client)

A modern SaaS front-end for managing venues, bookings, and availability.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with a custom, trusted indigo-violet theme (OKLCH)
- **shadcn/ui** (new-york style) + **lucide-react** icons
- **TanStack Query v5** for server state (+ Devtools)
- **Axios** with request/response interceptors
- **next-themes** dark / light / system mode
- **Sonner** toasts

## Getting started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL
npm run dev
```

Open http://localhost:3000.

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx            # Root layout, wires AppProviders
│  ├─ page.tsx              # Demo dashboard
│  └─ globals.css           # Tailwind v4 + theme tokens (light/dark)
├─ components/
│  ├─ providers/            # Theme + Query providers (single AppProviders entry)
│  ├─ ui/                   # shadcn/ui components
│  └─ theme-toggle.tsx      # Light/Dark/System switch
├─ features/
│  └─ venues/               # Example feature: types, api, hooks, UI
└─ lib/
   ├─ axios.ts              # Axios instance + interceptors + error normalizer
   ├─ query-client.ts       # QueryClient factory (SSR-safe singleton)
   └─ utils.ts              # cn() + formatting helpers
```

## Key building blocks

- **Axios** (`lib/axios.ts`): attaches the bearer token on every request and
  handles `401` globally (clears token, redirects to `/login`). Errors are
  normalized via `normalizeError()`.
- **TanStack Query** (`lib/query-client.ts` + `components/providers`): SSR-safe
  client with sane `staleTime`/`retry` defaults and Devtools in development.
- **Theming**: design tokens live in `globals.css`; toggle with `ThemeToggle`.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start the dev server     |
| `npm run build` | Production build         |
| `npm start`     | Run the production build |
| `npm run lint`  | Lint with ESLint         |

## Adding shadcn components

```bash
npx shadcn@latest add <component>
```
