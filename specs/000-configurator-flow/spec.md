# 000 — Roof configurator flow

Status: **APPROVED**

UI source of truth: "Roof configurator flow" design canvas (https://claude.ai/artifact/H5CJkWtfQuGirSuqFJFqqo). Mobile (390 px) and desktop (1440 px) artboards exist for every step.

This is a **demo project**: data is stubbed, defaults are chosen for convenience, and nothing is persisted.

## Why

Homeowners want a real roof price without waiting for a salesperson. The configurator lets them enter an address, design their roof, optionally add solar, and receive a **fixed price** in about 60 seconds, with no sales call and no obligation.

## Scope decisions (agreed with user)

- **Whole flow, thin slices.** One spec covers address → style → color → design → solar → review → done, delivered in vertical slices.
- **Roof measurement and pricing are server-side and stubbed.** A deterministic fake measurement and a demo price formula run in Nitro. Real providers are a later spec.
- **The flow ends at the price.** No quote persistence, email, or install-date booking. Those canvas elements are not built (nothing to hide, so no feature flags).
- **Address is a plain text input.** Only non-blank is validated. No geocoding, no service-area check.
- **Solar is a separate estimate computed in the browser** (canvas formulas). It is labeled "est.", never merged into the fixed roof price, and is not authoritative.
- **Step URLs are linkable.** Selections live in the URL.

## Demo data and defaults

| Item | Default |
|---|---|
| Material | Architectural shingle |
| Pattern | The material's default (shingle: Dimensional; metal: Wide seam; tile: Spanish S; slate: Uniform) |
| Color | Charcoal |
| Trim | White |
| Solar included | Yes, 600 kWh/month, North–South, panels = recommended |
| Quote hold | 7 days (hardcoded copy; nothing is stored) |

## Roof measurement stub (server)

`POST /api/measure { address }` → `{ roofAreaSqFt }`.
Deterministic from the normalized (trimmed, lower-cased) address: `1400 + (hash(address) mod 21) × 100`, i.e. 1,400–3,400 sq ft. Same address always returns the same area. Hash function is fixed in the plan.

## Price formula (server, demo values)

`POST /api/price { roofAreaSqFt, material, pattern, trim }` → `{ total, currency: "USD" }`.

```
total = round_to_10( roofAreaSqFt × (materialRate[material] + patternAdj[pattern]) + trimFee[trim] )
```

| Material | $/sq ft | | Pattern adj ($/sq ft) | | Trim | Fee |
|---|---|---|---|---|---|---|
| Architectural shingle | 6.00 | | 3-tab −1.00 · Dimensional 0 · Shake-look +1.50 | | White | 0 |
| Standing-seam metal | 11.00 | | Wide seam 0 · Narrow seam +1.00 · Board & batten +2.00 | | Black | 0 |
| Clay tile | 16.00 | | Spanish S 0 · Barrel +1.50 · Flat −1.00 | | Bronze | 900 |
| Synthetic slate | 18.00 | | Uniform 0 · Random width +1.50 · Fishscale +3.00 | | Match roof | 0 |

Example: 2,000 sq ft, shingle, Dimensional, white → $12,000. Values are demo-only and live in one server data module.

## Solar estimate (browser, demo constants from the canvas)

Constants: panel 400 W, 18 sq ft per panel, 65 % usable roof, $3.00/W installed.

| Orientation | Usable share | Yield (kWh/kW/yr) |
|---|---|---|
| North–South | 0.5 | 1,450 |
| East–West | 1.0 | 1,200 |
| Flat | 0.8 | 1,300 |

```
maxPanels   = floor(roofArea × share × 0.65 / 18)
perPanelKwh = 0.4 × yield
needed      = ceil(monthlyKwh × 12 / perPanelKwh)        (0 if usage = 0)
recPanels   = min(needed, maxPanels)
kW          = panels × 0.4
yearlyKwh   = round_to_10(kW × yield)
cost        = round_to_100(kW × 1000 × 3)
coverage %  = round(panels × perPanelKwh / (monthlyKwh × 12) × 100)
```

Roof area comes from the measurement and is read-only. Computation lives in one pure, unit-tested module.

## URL contract

| Step | Path |
|---|---|
| Address | `/` |
| Style | `/configure/style` |
| Color | `/configure/color` |
| Design | `/configure/design` |
| Solar | `/configure/solar` |
| Review | `/configure/review` |
| Done | `/configure/done` |

Selections are query params: `address`, `material`, `color`, `pattern`, `trim`, `solar` (`1`/`0`), `usage`, `orient`, `panels`. Missing or invalid params fall back to defaults. A step URL with a blank `address` redirects to `/`. Roof area is re-fetched from `/api/measure` for the address, not carried in the URL.

## User stories and acceptance criteria

### US-1 Address
- AC-1.1 The landing page shows a single address field and a "See my real price" CTA, per the canvas.
- AC-1.2 A blank address shows an inline error and does not advance.
- AC-1.3 Any non-blank address advances to Style (`/configure/style?address=…`). No other validation.
- AC-1.4 If `/api/measure` fails, the user sees an error with retry, and the address text is kept.

### US-2 Style
- AC-2.1 Four materials with description and tier ($/$$/$$$), as in the canvas.
- AC-2.2 Exactly one material is always selected (default above); selection updates the preview and the URL.

### US-3 Color
- AC-3.1 Eight colors: Charcoal, Weathered Wood, Slate Gray, Barkwood, Pewter, Desert Tan, Terracotta, Forest. Selection updates the preview and the URL.

### US-4 Design
- AC-4.1 Three patterns per material. Switching material resets the pattern to that material's default.
- AC-4.2 Trim: White, Black, Bronze, Match roof (follows roof color).
- AC-4.3 Preview reflects pattern and trim.

### US-5 Solar
- AC-5.1 "Include solar in my quote" toggle. Off removes solar from Review and Done.
- AC-5.2 Inputs: monthly kWh (non-negative integer), orientation, panel count clamped to 0..maxPanels. Roof area is displayed, not editable.
- AC-5.3 Recommended panels, max panels, kW, yearly kWh, coverage % and cost follow the formulas above. Changing usage or orientation recomputes the recommendation and resets panels to it.
- AC-5.4 Copy states the estimate is before incentives and not the final quote.

### US-6 Review and price
- AC-6.1 Review lists style, color, pattern, trim, solar, each with an "Edit" link to its step; other selections are preserved.
- AC-6.2 "See my real price" calls `/api/price` and navigates to Done with the result.
- AC-6.3 The price is **deterministic**: same area, material, pattern and trim always give the same total. Covered by server tests including the example above.
- AC-6.4 Only a total is shown (no breakdown).
- AC-6.5 A price failure shows an error with retry and keeps all selections.
- AC-6.6 The server rejects unknown material/pattern/trim ids and non-positive areas with a 4xx.

### US-7 Done
- AC-7.1 Shows the fixed total, the address, a configuration summary, and "held for 7 days".
- AC-7.2 If solar is included, its estimate appears on a separate line labeled "est.".
- AC-7.3 Email, reserve-install-date, and "What happens next" actions are not rendered.
- AC-7.4 Loading `/configure/done` directly (with valid params) recomputes the price from the server rather than relying on prior in-memory state.

### Cross-cutting
- AC-X.1 Stepper and Back/Continue behave as in the canvas; browser Back/Forward move between steps.
- AC-X.2 Layouts match the canvas at 390 px and 1440 px; desktop shows the live preview beside the options.
- AC-X.3 Accessible: labeled inputs, real buttons, visible focus, 44 px targets, 4.5:1 text contrast.
- AC-X.4 Reloading any step URL restores the same selections.

## Slices (delivery order)

1. Flow shell: routes, URL-backed state, stepper, address input, mobile + desktop layout.
2. Style, color, design steps with live preview.
3. Server: measure stub and price endpoint with tests.
4. Solar module and step.
5. Review and Done wired to the endpoints.

## Out of scope

- Real geocoding, roof measurement, rate data, service-area handling.
- Quote persistence, email, install-date booking, accounts/auth, feature flags.
- Incentives, financing, net metering. Price breakdown. Analytics, i18n.

## Open questions

None. The canvas header copy "SF Bay Area · Free online estimate" is kept as-is (decorative; no service-area logic).
