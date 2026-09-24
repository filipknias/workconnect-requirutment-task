# WorkConnect

A product catalogue built with Next.js 16. It
lists products in a paginated table and adds new
ones through a three-step form dialog — basic info, pricing with net/gross/VAT
recalculation, and availability.

There is no backend. The catalogue is seeded from a static array
(`apps/web/src/features/products/data/products.ts`), and products added in the
wizard live in client state only, so they disappear on a full page reload.

## Running the app

Prerequisites: Node.js 20.9 or newer (developed on Node 24) and pnpm 10. pnpm
is pinned through `packageManager` in the root `package.json`, so Corepack can
provide the right version:

```bash
corepack enable
pnpm install
pnpm dev
```

Then open <http://localhost:3000>. Pagination is kept in the URL, e.g.
`/?page=2`.

For a production build:

```bash
pnpm build
pnpm start
```

### Other commands

Run from the repository root; each fans out to every workspace via Turborepo.

```bash
pnpm lint        # eslint
pnpm typecheck   # next typegen + tsc --noEmit
pnpm test        # vitest run
```

To run a single workspace, filter it: `pnpm --filter web test`.

## Project structure

pnpm workspaces, orchestrated by Turborepo.

```
apps/
  web/                       Next.js 16 App Router application ("web")
packages/
  ui/                        @repo/ui — shared, buildless shadcn/ui components
  eslint-config/             @repo/eslint-config — shared ESLint flat configs
  typescript-config/         @repo/typescript-config — shared tsconfig bases
  vitest-config/             @repo/vitest-config — shared Vitest configs
turbo.json                   task pipeline (dev, build, start, lint, typecheck, test)
pnpm-workspace.yaml          workspace globs
```

### `apps/web/src`

```
app/
  layout.tsx                 root layout: fonts, NuqsAdapter, toast viewport
  page.tsx                   the only route — renders the products catalogue
  globals.css                imports the design tokens from @repo/ui
components/
  form/                      TanStack Form field components shared by all forms
    hooks/use-app-form.ts    the app-wide `useAppForm` binding
    hooks/use-field-presentation.ts
    context/field-context.ts
features/
  products/
    types/product.ts         Product, ProductsPage, ProductOption
    data/                    seed products and select options (categories, …)
    schema/                  Zod schemas for the wizard, one per step
    hooks/                   use-add-product-wizard (step state + submit),
                             use-page-link (shallow pagination links)
    utils/                   pure helpers: paging, price formatting and
                             net/gross recalculation, parsing form values
                             into a Product, labels, URL search params
    components/              catalogue, table, card list, pagination,
                             add-product dialog and its three step panels
```

### `packages/ui/src`

```
components/                  shadcn/ui components (base-nova style, Base UI),
                             plus custom ones: stepper, checkbox-chip-group, toast
styles/globals.css           the single Tailwind entry point and design tokens
lib/, hooks/                 empty, kept so the shadcn CLI resolves its aliases
```

Tests sit in a `__tests__/` folder next to the files they test (see
[Tests](#tests)).

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
  hooks/       the feature's React hooks
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

Forms use TanStack Form through one app-wide binding, `useAppForm`, in
`src/components/form/hooks/use-app-form.ts`. It registers the shared field
components (`TextField`, `SelectField`, `NumberField`, …), so a form renders
`<form.AppField name="…">{(field) => <field.TextField … />}</form.AppField>`.
Field components read their contexts from `context/field-context.ts`, never from
`use-app-form.ts`, or the two form an import cycle.

Zod 4 implements Standard Schema, so a schema is passed straight to TanStack
Form — there is no adapter package:

```tsx
useAppForm({ validators: { onChange: mySchema } });
```

Use the `field` component (`@repo/ui/components/field`) rather than shadcn's
legacy `form` component, which is react-hook-form specific.

### URL state

`nuqs` is mounted: `NuqsAdapter` wraps the app in `src/app/layout.tsx`.

Convention: a feature that reads search params declares its parsers once, in
`src/features/<feature>/utils/search-params.ts`, and every caller imports that
same object. Never redeclare a parser at a call site — the default would drift.

```ts
// src/features/products/utils/search-params.ts
export const productSearchParams = {
  page: parseAsInteger.withDefault(1),
};
```

Client components call `useQueryStates(productSearchParams)`. Paging is a
shallow URL update rather than a navigation (`use-page-link.ts`), because a
server round-trip would rebuild the list and drop products added in the wizard.

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
