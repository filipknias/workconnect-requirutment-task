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

`apps/web` uses `src/`, with `@/*` mapped to `./src/*`. The top level is grouped
by feature rather than by technical kind:

```
src/app/                 routes only — thin, delegating to features
src/components/          shared across features
src/features/<feature>/  everything for one feature
```

Inside a feature, group by kind. Not every folder is needed — add one when it
has something to hold:

```
src/features/products/
  types/       shared types for the feature — no runtime code
  data/        the source of truth and the seam over it
  schema/      Zod schemas, and the types inferred from them
  utils/       pure helpers: formatters, labels, search-param parsers
  components/  the feature's React components
```

Any kind folder with tests gets a `__tests__/` subfolder beside its sources —
`utils/__tests__/format-price.test.ts` tests `utils/format-price.ts`.

`src/components/` follows the same rule one level down — a shared module folder
keeps its components at the root and groups only what is not a component:

```
src/components/form/
  text-field.tsx  textarea-field.tsx  select-field.tsx  chip-group-field.tsx
  __tests__/   tests for the components at the root
  hooks/       use-app-form.ts, use-field-presentation.ts
    __tests__/ tests for the hooks
  context/     field-context.ts
```

There are no barrel files anywhere. Import the module you want by its path.

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
`src/features/<feature>/utils/search-params.ts`, and both the client hooks and
the server loader import that same object.

```ts
// src/features/shifts/utils/search-params.ts
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

Vitest, jsdom, Testing Library. Every folder that holds tested sources gets a
`__tests__/` subfolder, with one `<source>.test.ts(x)` per source file:

```
apps/web/src/features/products/utils/__tests__/format-price.test.ts
apps/web/src/components/form/hooks/__tests__/use-field-presentation.test.tsx
apps/web/src/app/__tests__/page.test.tsx       route tests too — Next never routes `_` folders
packages/ui/src/components/__tests__/dialog.test.tsx
```

The shared `@repo/vitest-config` collects `src/**/*.test.{ts,tsx}` and both
workspaces re-export `@repo/vitest-config/react` as-is. The glob is deliberately
broader than `__tests__/`, so a misplaced test still runs instead of being
silently skipped; the folder rule is a convention, not enforced. `globals: true`
is on, which is what gives Testing Library its automatic `cleanup` between
tests.

Both `globals.css` files carry `@source not "../**/__tests__"`, so class names
that appear only in tests never reach the output CSS.

Inside `packages/ui`, tests import components by relative path (`../dialog`)
rather than through `@repo/ui/...`.

There is no coverage tooling.

## The smoke page

`apps/web/src/app/page.tsx` is not a feature. It renders a Button, a Dialog and
a static Table from `@repo/ui` to prove the scaffold works end to end: package
resolution, Base UI hydration inside a server component, and Tailwind picking
up classes that exist only in `packages/ui`. Replace it with the first real
route.
