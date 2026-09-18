# WorkConnect

Foundations for the WorkConnect recruitment task. This repository is a scaffold:
it contains no features and no data. Everything here exists to make the first
real feature cheap to write.

## Layout

```
apps/web                 Next.js 16 App Router application
packages/ui              @repo/ui — shared, buildless shadcn/ui components
packages/eslint-config   @repo/eslint-config
packages/typescript-config @repo/typescript-config
packages/vitest-config   @repo/vitest-config
```

pnpm workspaces, orchestrated by Turborepo. pnpm is enforced via
`packageManager` in the root `package.json`.

## Commands

Run from the repository root; each fans out to every workspace via Turborepo.

```bash
pnpm install
pnpm dev         # next dev
pnpm build       # next build
pnpm lint        # eslint
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest run
```

## Conventions

### `packages/ui` is presentation only

`@repo/ui` ships raw `.tsx` through its `exports` map — there is no build step
and no `dist/`. Next transpiles it automatically; `transpilePackages` is not
needed on Next 16.

It holds shadcn/ui components and nothing else. No Zod schemas, no TanStack
Form bindings, no nuqs parsers. A component there takes props and renders;
anything that knows about validation, URL state or data belongs in `apps/web`.

Components live flat in `packages/ui/src/components/`, exactly as the shadcn
CLI writes them. Add new ones with the CLI rather than by hand:

```bash
pnpm --filter @repo/ui exec shadcn add <component>
```

The CLI is configured for the `base-nova` style, which is built on
[Base UI](https://base-ui.com) (`@base-ui/react`), not Radix. Base UI composes
through a `render` prop, not `asChild`:

```tsx
<DialogTrigger render={<Button>Open</Button>} />
```

`cn` comes from the `cn` npm package. There is no `lib/utils.ts` to import it
from. The empty `src/lib/` and `src/hooks/` directories are kept only so the
CLI can resolve its `lib` and `hooks` aliases; deleting them breaks
`shadcn add`.

### Styling

`packages/ui/src/styles/globals.css` is the single Tailwind entry point and
owns every design token. `apps/web/src/app/globals.css` does nothing but import
it. Add tokens there, not in the app.

Dark mode is system-driven only — `@custom-variant dark (@media
(prefers-color-scheme: dark))`, no toggle and no `next-themes`.

That file also carries a load-bearing `@source "../**/*.{ts,tsx}"`. Tailwind
skips `node_modules` during automatic source detection, and `packages/ui` is
symlinked there, so without it every class used only inside a `@repo/ui`
component silently disappears from the output CSS.

### Feature-first structure in `apps/web`

`apps/web` uses `src/`, with `@/*` mapped to `./src/*`. Group code by feature
rather than by technical kind:

```
src/app/                 routes only — thin, delegating to features
src/features/<feature>/  components, schemas, parsers, hooks for one feature
```

### Forms

`zod` and `@tanstack/react-form` are installed but deliberately unwired. There
is no `useAppForm` binding and no multistep shell yet; build them with the
first real form so the abstraction is shaped by a real case.

Zod 4 implements Standard Schema, so a schema is passed straight to TanStack
Form — there is no adapter package:

```tsx
useForm({ validators: { onChange: mySchema } })
```

Use the `field` component (`@repo/ui/components/field`) rather than shadcn's
legacy `form` component, which is react-hook-form specific.

### URL state

`nuqs` is mounted: `NuqsAdapter` wraps the app in `src/app/layout.tsx`. Nothing
else is scaffolded.

Convention: a feature that reads search params declares its parsers once, in
`src/features/<feature>/search-params.ts`, and both the client hooks and the
server loader import that same object.

```ts
// src/features/shifts/search-params.ts
import { createLoader, parseAsInteger, parseAsString } from "nuqs/server";

export const shiftSearchParams = {
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

export const loadShiftSearchParams = createLoader(shiftSearchParams);
```

Client components then call `useQueryStates(shiftSearchParams)`, and server
components call `loadShiftSearchParams(searchParams)`. Never redeclare a parser
at a call site — the default would drift between the two.

`Pagination` from `@repo/ui` ships unwired; `PaginationLink` renders a plain
`<a href>`. Wiring it to nuqs means swapping in a Next `<Link>` or a button.

### Tests

Vitest, jsdom, Testing Library. Tests live in a per-workspace `tests/`
directory, never alongside the source under `src/`.

Each workspace has a `vitest.config.mts` that re-exports the shared
`@repo/vitest-config/react`. `globals: true` is on, which is what gives
Testing Library its automatic `cleanup` between tests.

Inside `packages/ui`, tests import components by relative path
(`../src/components/dialog`) rather than through `@repo/ui/...`.

There is no coverage tooling.

## The smoke page

`apps/web/src/app/page.tsx` is not a feature. It renders a Button, a Dialog and
a static Table from `@repo/ui` to prove the scaffold works end to end: package
resolution, Base UI hydration inside a server component, and Tailwind picking
up classes that exist only in `packages/ui`. Replace it with the first real
route.
