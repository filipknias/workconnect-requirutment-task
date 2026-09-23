### Rules

- Never speculate about code you have not opened. If the user references a
  specific file, you MUST read the file before answering. Make sure to
  investigate and read relevant files BEFORE answering questions about the
  codebase. Never make any claims about code before investigating unless you are
  certain of the correct answer - give grounded and hallucination-free answers.

### Deep Modules

Prefer deep modules: small interface, deep implementation. A few methods with
simple params hiding complex logic behind them.

Avoid shallow modules: large interface with many methods that just pass through
to thin implementation. When designing, ask: can I reduce the number of methods?
Can I simplify the parameters? Can I hide more complexity inside?

### Additional tips

- Do not verify with browsers or computer use unless the user explicitly agrees
  or requests it.
- Security is important but should not be over-indexed on, especially for
  dev-mode or maintainer-only features.

### Repository layout

pnpm workspaces + Turborepo. `apps/web` (Next 16 App Router, `src/` +
feature-first), `packages/ui` (`@repo/ui`), and three config packages:
`@repo/eslint-config`, `@repo/typescript-config`, `@repo/vitest-config`.

Inside `apps/web/src`, the top level is grouped by feature and each feature is
grouped by kind: `types/`, `data/`, `schema/`, `utils/`, `components/` — only
the folders a feature actually needs. `src/components/<module>/`
does the same but keeps its components at the root, grouping only `hooks/` and
`context/`. No barrel files anywhere.

Run gates from the root: `pnpm lint`, `pnpm typecheck`, `pnpm test`,
`pnpm build`. Do not add a root `tsconfig.json`; each workspace owns its own.

### Things that will bite you

- **`packages/ui/src/styles/globals.css` contains a load-bearing
  `@source "../**/*.{ts,tsx}"`.** Tailwind skips `node_modules` during source
  detection and `packages/ui` is symlinked there. Remove that line and every
  class used only inside a `@repo/ui` component vanishes from the output CSS —
  silently, with no build error.
- **Dark mode is hand-edited.** Decision: system-only, via
  `@custom-variant dark (@media (prefers-color-scheme: dark))` plus a
  `@media (prefers-color-scheme: dark) { :root { … } }` token block. The shadcn
  CLI emits a `.dark` class variant instead, so `shadcn init --force` will
  revert both spots. Re-apply them afterwards.
- **`shadcn init` cannot run in `packages/ui`** — the CLI refuses any workspace
  it does not recognise as a framework. `packages/ui/components.json` is
  therefore checked in, matching what shadcn's own monorepo scaffolder writes.
  `shadcn add` works normally:
  `pnpm --filter @repo/ui exec shadcn add <component>`.
- **The style is `base-nova`, not Radix.** Components import
  `@base-ui/react/*` and compose through a `render` prop, not `asChild`. Most
  shadcn monorepo tutorials online predate this and are wrong for this repo.
- **`cn` is an npm package**, imported as `import { cn } from "cn"`. There is
  no `lib/utils.ts`, no `clsx` and no `tailwind-merge`.
- **`transpilePackages` is not needed.** Next 16 transpiles workspace packages
  automatically. Adding it is cargo cult.
- **`@repo/vitest-config/react.ts` imports its sibling via the package's own
  name** (`@repo/vitest-config/base`), not a relative path. Vite externalises
  config imports, so Node resolves them — a relative `./base` would need a file
  extension that TypeScript then rejects.

### Scaffold boundaries

`packages/ui` is presentation only: no Zod, no TanStack Form, no nuqs. Zod and
TanStack Form are installed but unwired on purpose — there is no `useAppForm`
binding and no multistep shell yet. Build them with the first real form.

A test goes in a `__tests__/` folder inside the folder of the file it tests,
named `<source>.test.ts(x)` — e.g. `utils/format-price.ts` is tested by
`utils/__tests__/format-price.test.ts`. This covers `packages/ui` and routes
(`src/app/__tests__/`) too; there is no workspace-level `tests/` directory. Vitest
collects `src/**/*.test.{ts,tsx}`, so a misplaced test still runs — nothing
enforces the folder, so put it in the right place. Both `globals.css` files
exclude `__tests__` from Tailwind source detection via `@source not`.

See `README.md` for the full conventions, including the nuqs shared-parser
convention.
