# 000 — Roof configurator flow: Plan

Status: **APPROVED**
Spec: [spec.md](./spec.md) (approved). Section and AC numbers below refer to it.

## Decisions (agreed with user)

| Topic | Decision |
|---|---|
| Lint/format | ESLint via `@nuxt/eslint` (flat config, stylistic rules on; no Prettier). `pnpm lint` runs `eslint .` |
| Database | Deferred. No SQLite/ORM code or dependencies in this feature |
| CI / hosting | None. Typecheck, lint and tests run locally before every commit |

## New dependencies

Only `@nuxt/eslint` and `eslint` (dev). Reason: AGENTS.md requires lint to pass before each commit and no linter exists. Everything else uses what the scaffold already has. No validation library (hand-written guards), no state library (URL is the state), no icon/font packages.

## Architecture

**The URL is the single source of truth for selections.** There is no store. A composable reads `route.query`, applies defaults, and writes changes with `router.replace`. This gives linkable steps, reload restore and browser Back/Forward (AC-X.1, X.4) with no extra mechanism.

Shared pure modules (Nuxt 4 `shared/` dir, importable by app and server) hold everything that is testable without a DOM or HTTP.

```
shared/
  catalog.ts        # materials, patterns, colors, trims: ids, names, hex, tier, texture params
  configuration.ts  # Configuration type, DEFAULTS, parseQuery(query) -> Configuration, toQuery(config)
  solar.ts          # constants + estimateSolar(input) per spec formulas (pure)
  preview.ts        # texturePath(), panelPath(), panelSlots(): SVG path builders ported from canvas
  steps.ts          # STEPS list, labels, paths, next/prev
server/
  utils/
    hash.ts         # fnv1a32(string) -> number
    measure.ts      # measureRoof(address) -> { roofAreaSqFt }
    pricing.ts      # RATES tables + computePrice(input) -> { total, currency }
    validate.ts     # isMaterialId / isPatternFor / isTrimId / area guard -> throws createError(400)
  api/
    measure.post.ts
    price.post.ts
app/
  assets/css/main.css      # Tailwind import + @theme tokens
  composables/
    useConfiguration.ts    # URL-backed reactive config + setters
    useRoofArea.ts         # useAsyncData -> /api/measure, keyed by normalized address
    usePrice.ts            # useAsyncData -> /api/price, keyed by config fingerprint
  middleware/
    address.ts             # blank address on /configure/* -> redirect to /
  pages/
    index.vue              # address landing (US-1)
    configure.vue          # parent route: header, stepper, live preview, Back/Continue
    configure/
      style.vue color.vue design.vue solar.vue review.vue done.vue
  components/
    AppHeader.vue  StepperNav.vue  RoofPreview.vue  OptionCard.vue  SwatchButton.vue
    AddressForm.vue  SolarPanel.vue  SummaryList.vue  PriceCard.vue  ErrorRetry.vue
tests/
  unit/    # shared/*, server/utils/*, composables, key components
  e2e/     # flows, deep links, API contract
```

Files stay small and single-purpose. Each page renders only its step's options; shell concerns live in `configure.vue`.

### Responsive layout

One responsive implementation, not two. Tailwind breakpoint `lg` (1024 px) switches from the mobile layout (390 px canvas) to the desktop layout (1440 px canvas): preview beside the options, stepper in the header. Both are checked against the canvas artboards (AC-X.2).

### Styling tokens (`@theme`, derived from the canvas)

Colors: `accent #C2410C`, `ink #15171A`, `muted #5B6168`, `line #E3E5E8`, `field #C9CDD2`, `selected #FFF7F2`, `danger #B42318`, `canvas-white #FFFFFF`. Fonts: Inter (body), Space Grotesk (logo/headings), loaded with a Google Fonts `<link>` in `app.head`, same as the canvas. Contrast of each text/background pair is checked against 4.5:1 (AC-X.3).

## Data model

```ts
type MaterialId = 'shingle' | 'metal' | 'tile' | 'slate'
type TrimId = 'white' | 'black' | 'bronze' | 'match'
type OrientId = 'ns' | 'ew' | 'flat'

interface Configuration {
  address: string
  material: MaterialId
  pattern: string            // must belong to material, else material default
  color: string              // one of the 8 color ids
  trim: TrimId
  solar: boolean
  usage: number              // kWh/month, non-negative integer
  orient: OrientId
  panels?: number            // undefined = use recommendation
}
```

**Query contract** (spec URL section): `address, material, color, pattern, trim, solar (1|0), usage, orient, panels`. `parseQuery` never throws: every invalid or missing value falls back to its default. `toQuery` omits values equal to defaults except `address`, keeping URLs short. Changing `material` resets `pattern`; changing `usage` or `orient` drops `panels` (AC-4.1, AC-5.3).

## API contracts

Both endpoints are `POST`, JSON, deterministic, no side effects.

### `POST /api/measure`
Request `{ "address": string }` → `200 { "roofAreaSqFt": number }`.
- `roofAreaSqFt = 1400 + (fnv1a32(normalize(address)) % 21) * 100`, where `normalize` = trim + lower-case; `fnv1a32` is the standard 32-bit FNV-1a over the UTF-8 bytes, returned as an unsigned integer.
- Blank/missing address → `400`.

### `POST /api/price`
Request `{ "roofAreaSqFt": number, "material": MaterialId, "pattern": string, "trim": TrimId }` → `200 { "total": number, "currency": "USD" }`.
- `total = roundTo10(area * (rate[material] + adj[pattern]) + trimFee[trim])`, tables exactly as in the spec, stored in `server/utils/pricing.ts`.
- `400` for unknown material/trim, a pattern that does not belong to the material, or an area that is not a finite number in `(0, 100000]`.
- Error body uses Nitro's `createError`: `{ statusCode, statusMessage, data: { field } }`.

The solar estimate has no endpoint (spec: computed in the browser).

## Flow behavior

- **Address → Style** (`AddressForm`): blank → inline error (AC-1.2); otherwise `router.push('/configure/style?address=…')`.
- **Roof area**: `useRoofArea` runs when the shell mounts with an address; on failure `ErrorRetry` shows with retry and the address is kept (AC-1.4). Solar needs the area; other steps do not block on it.
- **Review → Done**: the CTA calls `/api/price` and, on success, navigates to Done; on failure it shows `ErrorRetry` on Review and keeps all selections (AC-6.2, 6.5).
- **Done**: always fetches the price via `usePrice` (server-rendered), so a direct load works (AC-7.4). The price is deterministic, so Review's check and Done's fetch agree.
- **Solar line**: computed with `estimateSolar` from the measured area and the URL config, rendered as a separate "est." line (AC-6.5/7.2). It never touches `total`.
- **Edit links** on Review go to the step path with the current query unchanged (AC-6.1).
- **Not built**: email, reserve date, "What happens next" (AC-7.3).

## Preview

`RoofPreview.vue` is inline SVG, ported from the canvas artboards (`Desktop.dc.html` holds the full markup). Path generation (`texturePath`, `panelSlots`, `panelPath`) moves into `shared/preview.ts` as pure functions with unit tests; the component only binds colors and paths. Alt text/`aria-label` describes the selection, as in the canvas (`previewLabel`).

## Test strategy

| Layer | What | Where |
|---|---|---|
| Unit (pure) | `parseQuery`/`toQuery` round-trip, invalid-value fallbacks, material→pattern reset; `estimateSolar` against hand-computed cases incl. usage 0 and clamping; `computePrice` incl. the spec example ($12,000) and every material/pattern/trim; `measureRoof` determinism, range, normalization; `fnv1a32` known vectors; catalog invariants (3 patterns/material, 8 colors, defaults exist) | `tests/unit/shared`, `tests/unit/server` |
| Unit (guards) | `validate.ts` rejects bad ids/areas | `tests/unit/server` |
| Component | `AddressForm` blank error; `StepperNav` current/complete state; `OptionCard` pressed state | `tests/unit/components` |
| API contract | `/api/measure` and `/api/price`: success, determinism, 400 cases, via Playwright `request` fixture against the built app | `tests/e2e/api.spec.ts` |
| E2E | Full happy path at 390 px and 1440 px; blank-address error; deep link to `/configure/color?...`; reload restores selections; browser Back; deep link to Done shows price; solar off removes solar line; solar line labeled "est."; step URL without address redirects to `/` | `tests/e2e/flow.spec.ts` |

Expected e2e prices are computed from the exported pure functions plus one hard-coded literal, so a formula edit fails tests loudly. The scaffold's placeholder unit/e2e tests are replaced as the real home page lands.

## Risks and notes

- **Query-string state grows long** (address + 9 params). Defaults are omitted to keep it short; acceptable for a demo.
- **Hydration**: `parseQuery` is pure and SSR-safe; nothing reads `window`. Price/area fetches use `useAsyncData` so SSR and client agree.
- **TypeScript 6 / pnpm 12** constraints from AGENTS.md apply. Adding `@nuxt/eslint` may need `pnpm approve-builds` for a single named package only, never `--all`.
- **Canvas fidelity**: exact spacing/typography are taken from canvas files during each UI task; if a canvas detail contradicts the spec, stop and ask.
- **Out of scope** items from the spec stay out; no SQLite, flags, CI, or deployment config.

## Delivery order

Matches the spec's slices: (1) tooling + shell and URL state, (2) design steps and preview, (3) server endpoints and tests, (4) solar, (5) review/done and e2e. Detailed ordering and sizing go in `tasks.md` after plan approval.
