# 000 — Roof configurator flow: Tasks

Status: **APPROVED**
Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md) (both approved)

## How to use this file

- Tasks are ordered; each depends only on earlier tasks. One task = one commit on `main`.
- Sonnet turns each task into a self-contained brief for Haiku (task text, spec/plan excerpts, files, acceptance criteria). Haiku does not change specs or scope; if a brief is ambiguous it returns questions.
- **Done = Sonnet has run `pnpm typecheck && pnpm lint && pnpm test` (plus `pnpm test:e2e` where listed) and all pass.** Lint exists from T01 onward; before T01 the lint step is skipped.
- Commit message: `<type>(000): <task title> [T<NN>]`.
- Canvas details (spacing, copy, SVG markup) live in the design canvas files `project/Main.dc.html` (mobile) and `project/Desktop.dc.html` (desktop). Sonnet extracts the relevant excerpt into each UI brief; Haiku does not need canvas access.
- Tick `[x]` when a task is committed.

## Slice 1 — Tooling, theme, shared domain

- [x] **T01 · Add ESLint**
  Add dev deps `@nuxt/eslint` and `eslint` (Nuxt module, flat config, stylistic rules, no Prettier). Add `"lint": "eslint ."` script. Fix findings in existing files. Update the `pnpm lint` line in AGENTS.md from "TBD" to the real command (Sonnet edits AGENTS.md).
  *Files:* `package.json`, `nuxt.config.ts`, `eslint.config.mjs`, existing sources, `AGENTS.md`.
  *Accept:* `pnpm lint` exits 0; typecheck and tests still pass. `pnpm approve-builds` used only for a single named package if prompted, never `--all`.

- [x] **T02 · Theme tokens and fonts**
  Add `@theme` tokens to `app/assets/css/main.css`: colors `accent #C2410C`, `ink #15171A`, `muted #5B6168`, `line #E3E5E8`, `field #C9CDD2`, `selected #FFF7F2`, `danger #B42318`; font families `Inter` (body) and `Space Grotesk` (display). Add the Google Fonts `<link>` (Inter 400/500/600, Space Grotesk 500/600/700) to `app.head` in `nuxt.config.ts`. Set `body` text color/font from tokens.
  *Accept:* a unit test renders an element with `text-ink bg-selected` classes without error; `pnpm build` succeeds.

- [ ] **T03 · Catalog**
  `shared/catalog.ts`: export typed `MATERIALS` (id, name, description, tier, defaultPatternId, patterns[]), `COLORS` (id, name, hex), `TRIMS` (id, name, hex|null), plus id types. Data exactly as in the spec and canvas (4 materials × 3 patterns incl. each pattern's texture params `rows/ticks/seams/arcs/batten`, 8 colors, 4 trims). Helpers: `getMaterial`, `getPattern(materialId, patternId)`, `isMaterialId`, `isTrimId`, `isColorId`.
  *Tests (`tests/unit/shared/catalog.test.ts`):* 4 materials, 3 patterns each, default pattern belongs to its material, 8 colors, ids unique, shingle default pattern = Dimensional, metal = Wide seam, tile = Spanish S, slate = Uniform.

- [ ] **T04 · Steps**
  `shared/steps.ts`: `STEPS` (address, style, color, design, solar, review, done) with label and path (`/`, `/configure/<step>`); helpers `nextStep`, `prevStep`, `stepFromPath`, and the CTA label per step (canvas: "See my real price", "Continue to color", "Continue to design", "Continue to solar", "Review my roof", "See my real price").
  *Tests:* order, next/prev at ends return `undefined`, path round-trip.

- [ ] **T05 · Configuration and query parsing**
  `shared/configuration.ts`: `Configuration` type, `DEFAULTS` (shingle, Dimensional, charcoal, white, solar on, usage 600, `ns`, panels undefined, address ''), `parseQuery(query)` and `toQuery(config)` per the plan's query contract. Never throws; invalid values fall back to defaults; `pattern` not belonging to the material falls back to the material default; `usage` must be a non-negative integer; `panels` a non-negative integer or undefined. `toQuery` omits default values except `address`. Helpers returning new configs: `withMaterial` (resets pattern), `withUsage`/`withOrient` (clear panels).
  *Tests:* round-trip for several configs; each invalid value → default; arrays in query (`?color=a&color=b`) handled (first value); material change resets pattern; usage/orient change clears panels; empty address preserved as ''.

## Slice 3 — Server (built early so UI tasks can consume it)

- [ ] **T06 · Hash and measurement**
  `server/utils/hash.ts` (`fnv1a32(str): number`, UTF-8, unsigned) and `server/utils/measure.ts` (`normalizeAddress`, `measureRoof(address) → { roofAreaSqFt }`, formula in the plan).
  *Tests:* known FNV-1a vectors (`""` → `0x811c9dc5`, `"a"` → `0xe40c292c`, `"foobar"` → `0xbf9cf968`); area is in 1400–3400 and a multiple of 100; same address with different case/whitespace → same area; different addresses produce more than one distinct area across a sample of 50.

- [ ] **T07 · Pricing and validation**
  `server/utils/pricing.ts` (rate, pattern-adjustment and trim-fee tables exactly as in the spec; `computePrice({roofAreaSqFt, material, pattern, trim}) → { total, currency: 'USD' }`, `roundTo10`) and `server/utils/validate.ts` (guards that throw `createError({ statusCode: 400, statusMessage, data: { field } })` for unknown material/trim, pattern not in material, area not a finite number in (0, 100000], blank address).
  *Tests:* spec example 2000 sq ft shingle/Dimensional/white = 12000; one case per material; each pattern adjustment; bronze fee; rounding to 10; every guard failure.

- [ ] **T08 · API routes + contract tests**
  `server/api/measure.post.ts` and `server/api/price.post.ts` using T06/T07 (read JSON body, validate, return result).
  *Tests (`tests/e2e/api.spec.ts`, Playwright `request`):* measure success + determinism + blank → 400; price success (12000 case) + determinism + each 400 case. Run `pnpm test:e2e` (first run may need `pnpm exec playwright install chromium`).

## Slice 4 (shared part) — Solar and preview math

- [ ] **T09 · Solar estimate**
  `shared/solar.ts`: constants (400 W, 18 sq ft, 0.65, $3.00/W, orientation share/yield table) and `estimateSolar({ roofAreaSqFt, usage, orient, panels? }) → { maxPanels, recPanels, panels, kw, yearlyKwh, cost, coverage, needed }` per the spec formulas. `panels` is clamped to 0..maxPanels; undefined → `recPanels`. Usage 0 → needed 0, coverage 0.
  *Tests:* hand-computed cases for each orientation (e.g. 2000 sq ft, `ns`: max = floor(2000×0.5×0.65/18) = 36); needed > max (recommendation capped); usage 0; panels above max clamped; rounding of kWh (10) and cost (100).

- [ ] **T10 · Preview path builders**
  `shared/preview.ts`: port `texturePath(pattern, l, t, r, b, scale)`, `panelSlots()`, `panelPath(n)` from the canvas script (`Desktop.dc.html`, script block) as pure TypeScript. Use the catalog's pattern params.
  *Tests:* output for each of the 12 patterns is a non-empty string starting with `M`; `panelPath(0)` is `''`; `panelPath(n)` for n beyond slot count is capped; snapshot of one pattern per material.

## Slice 1 (UI) — Shell and address

- [ ] **T11 · URL-backed configuration composable**
  `app/composables/useConfiguration.ts`: reads `useRoute().query` via `parseQuery`, exposes a reactive `config` plus `set(partial)` helpers using `withMaterial/withUsage/withOrient` and `router.replace({ query: toQuery(...) })`; `goToStep(step)` pushes the step path keeping the query. `app/middleware/address.ts`: on `/configure/*` with blank address, redirect to `/`.
  *Tests:* with a mocked route/router (`@nuxt/test-utils`), changing the material updates the query and resets pattern; middleware redirects blank address and passes otherwise.

- [ ] **T12 · Address landing**
  Replace the scaffold `app/app.vue` with `<NuxtLayout><NuxtPage/></NuxtLayout>`; add `AppHeader.vue` (logo "Openly.Roofing", "SF Bay Area · Free online estimate" on the landing page) and `AddressForm.vue` and `app/pages/index.vue` per the canvas (headline, subcopy, field with visible label "Home address", "See my real price" CTA, trust line, "How it works" 3 steps). Blank → inline error, `aria-invalid`, focus on the field; non-blank → push `/configure/style?address=…`. Replace the scaffold unit/e2e tests.
  *Accept (AC-1.1–1.3):* component tests for blank error and navigation; `tests/e2e/home.spec.ts` updated to the new landing.

- [ ] **T13 · RoofPreview component**
  `app/components/RoofPreview.vue`: inline SVG ported from the canvas using `shared/preview.ts`. Props: `roofColor`, `trimColor`, `texturePath`, `panelsPath`, `label` (used as `role="img"` `aria-label`). No logic beyond binding.
  *Tests:* renders the given colors and label; panels path omitted when empty.

- [ ] **T14 · Configure shell and stepper**
  `app/pages/configure.vue` (parent route) + `StepperNav.vue`: header stepper (steps 1–5: Style, Color, Design, Solar, Review) with current/complete states and `aria-current="step"`; clicking any step navigates keeping the query; Back/Continue footer with CTA labels from `shared/steps.ts`; the live preview from `useConfiguration` (hidden on Review/Done as in the canvas); `definePageMeta({ middleware: 'address' })`. Responsive: mobile layout below 1024 px, preview beside options at `lg`. Add placeholder child pages for the six steps so routing works.
  *Tests:* StepperNav marks current/complete; browser-level check that `/configure/color?address=x` renders with Color current.

## Slice 2 — Design steps

- [ ] **T15 · Style step**
  `OptionCard.vue` (pressed/selected state, tier, description, radio-dot per canvas; real `<button aria-pressed>`) and `app/pages/configure/style.vue` listing the four materials. Selection updates query and preview. (AC-2.1, 2.2)
  *Tests:* component test for pressed state; selecting metal updates `material` in the query.

- [ ] **T16 · Color step**
  `SwatchButton.vue` and `app/pages/configure/color.vue`: 8 swatches, selected ring, color name label, "Shown on {material}" subcopy. (AC-3.1)
  *Tests:* selecting Terracotta sets `color=terra` and preview color changes.

- [ ] **T17 · Design step**
  `app/pages/configure/design.vue`: pattern tiles (using `texturePath` per tile) for the current material, trim swatches (Match roof follows roof color). Switching material elsewhere resets pattern to its default. (AC-4.1–4.3)
  *Tests:* pattern list matches the material; choosing Bronze sets `trim=bronze`; "Match roof" swatch color equals roof color.

## Slice 4 (UI) — Solar

- [ ] **T18 · Roof area and error component**
  `app/composables/useRoofArea.ts` (`useAsyncData` → `POST /api/measure`, key by normalized address, exposes `area`, `status`, `refresh`) and `ErrorRetry.vue` (message + Retry button, `role="alert"`). Wire the shell so a measurement failure shows `ErrorRetry` and keeps the address. (AC-1.4)
  *Tests:* composable returns the server's area (mock `$fetch`); failure shows `ErrorRetry`; retry calls refresh.

- [ ] **T19 · Solar step**
  `SolarPanel.vue` and `app/pages/configure/solar.vue` per the canvas: include toggle (`role="switch"`), monthly usage input with label, read-only roof area, orientation buttons, panels −/+ clamped, "Use N" recommendation button, system size / yearly power / est. cost, disclaimer copy. All numbers from `estimateSolar`. Off state hides details. Updates the query via `useConfiguration`. (AC-5.1–5.4)
  *Tests:* component tests: toggle off hides numbers; usage change recomputes recommendation and clears `panels`; `+` stops at max; area has no input.

## Slice 5 — Review and Done

- [ ] **T20 · Review step**
  `SummaryList.vue` and `app/pages/configure/review.vue`: rows Style, Color, Pattern, Trim & gutters, Solar (value as in the canvas, e.g. "36 panels · 14.4 kW · covers 80%" or "Not included") each with an "Edit" link to its step keeping the query (trim → design). `app/composables/usePrice.ts` wraps `POST /api/price` (needs the measured area). The CTA "See my real price" shows a loading state, navigates to Done on success, shows `ErrorRetry` and keeps selections on failure. (AC-6.1, 6.2, 6.5)
  *Tests:* summary rows reflect config; Edit links keep the query; failed price shows error and stays on Review.

- [ ] **T21 · Done step**
  `PriceCard.vue` and `app/pages/configure/done.vue`: headline "Your roof price is ready", fixed total (formatted `$12,000`), address, "held for 7 days", configuration summary, separate "est." solar line when solar is included. Price fetched on load (SSR) via `usePrice`; direct visit works. No email/reserve/next-steps UI. (AC-6.4, 7.1–7.4)
  *Tests:* formatting; solar line present only when included; total never includes the solar cost.

## Verify

- [ ] **T22 · End-to-end flows**
  `tests/e2e/flow.spec.ts`: happy path at 390×844 and 1440×960; blank-address error; deep link to a color URL; reload restores selections; browser Back moves one step; deep link to Done shows the price (expected value computed with `measureRoof` + `computePrice`, plus one hard-coded literal); solar off removes the solar line; solar line labeled "est."; step URL with no address redirects to `/`.

- [ ] **T23 · Accessibility and canvas fidelity pass**
  Sonnet-led: run the app, compare each step to the canvas at 390 px and 1440 px, check keyboard navigation, visible focus, 44 px targets, text contrast ≥ 4.5:1 (AC-X.2, X.3). File fixes as small follow-up commits referencing this task. Final full run of typecheck, lint, unit and e2e. Update spec/plan only with user approval if a contradiction is found.

## Dependency summary

T01–T05 shared/tooling · T06–T08 server (needs T03) · T09–T10 pure math (needs T03) · T11 (needs T04, T05) · T12 (needs T04, T11) · T13 (needs T10) · T14 (needs T11, T13) · T15–T17 (need T14) · T18 (needs T08, T14) · T19 (needs T09, T18) · T20–T21 (need T08, T18) · T22–T23 last.
