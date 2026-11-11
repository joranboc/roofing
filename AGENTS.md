# AGENTS.md

Guidance for all AI agents working in this repository. If something is unclear or not covered here, **do not assume — ask the user** and wait for the answer.

## Product

**Openly Roofing** is a self-serve roof configurator. A homeowner:

1. Enters an address.
2. Designs a roof: material, color, pattern, trim.
3. Optionally adds solar.
4. Receives a fixed price.

**UI source of truth:** the "Roof configurator flow" design canvas — https://claude.ai/artifact/H5CJkWtfQuGirSuqFJFqqo (read it with the Artifact tool, `action: "read"`). If the canvas and a spec disagree, stop and ask the user.

## Stack

| Concern | Choice |
|---|---|
| Frontend | Nuxt 4 |
| Backend | Nitro (Nuxt server) |
| Runtime | Node.js 26 LTS |
| Language | TypeScript, `strict` mode, app and server |
| Styling | Tailwind CSS |
| Package manager | pnpm |
| Database | SQLite |
| Unit/integration tests | Vitest (with `@nuxt/test-utils`) |
| End-to-end tests | Playwright |

Pin the Node version (`.nvmrc` / `engines`) and the pnpm version (`packageManager`). Never use npm or yarn.

### Open decisions (TBD — ask before choosing)

- ORM / query layer and migration tool for SQLite
- Pricing engine design and data source for materials/prices
- Address lookup / geocoding / roof-measurement provider
- Solar estimation source
- Hosting / deployment target and CI provider
- Lint/format tooling, Tailwind theme tokens (derive from the design canvas)
- Authentication and quote persistence requirements

## Spec-Driven Development

Specs are plain Markdown in `/specs`. **No implementation without an approved spec.**

```
specs/
  <NNN>-<feature-slug>/
    spec.md    # what & why: user stories, acceptance criteria, out of scope
    plan.md    # how: architecture, data model, API contracts, test strategy
    tasks.md   # small, ordered, independently verifiable tasks
```

Workflow: **spec → plan → tasks → implement → verify**. Each stage needs user approval before the next starts. Specs are the source of truth; if implementation reveals a spec problem, update the spec first (with user approval), then the code. Open questions go in a `## Open questions` section of the spec and must be resolved by the user, not guessed.

## Multi-agent roles

| Role | Model | Responsibility |
|---|---|---|
| Advisor | Opus | Consulted **only on request** (by the user or by Sonnet when blocked or uncertain). Advises on specs, architecture, plans and reviews. Does not edit code. |
| Orchestrator | Sonnet | Talks to the user, writes/updates specs, plans and tasks, delegates tasks to Haiku, verifies results, commits. Escalates to Opus when stuck. |
| Developer | Haiku | Implements one well-scoped task from `tasks.md` at a time, including its tests. Does not change specs or scope. Reports back to Sonnet. |

Rules:

- Haiku receives self-contained task briefs (task, relevant spec excerpts, files, acceptance criteria). If a brief is ambiguous, Haiku returns questions rather than guessing.
- Any agent with a doubt about requirements surfaces it to Sonnet, and Sonnet confirms with the user.
- Sonnet must verify Haiku's work (run tests/typecheck) before committing. Never claim success without running the checks.

## Trunk-based development

- **Commit directly to `main`.** No long-lived branches, no PRs.
- Commits are small and frequent; each is one logical change per task.
- `main` must always be green: before every commit run typecheck, lint, and tests locally. Do not commit failing code.
- Incomplete features are hidden behind feature flags, not branches.
- Commit messages: imperative mood, reference the spec/task (e.g. `feat(001): add address step`).
- Never force-push, rewrite history, or skip hooks without explicit user approval.
- Pushing to a remote is an outward-facing action: confirm with the user first unless they've said otherwise.

## Working agreements

- Don't assume; **ask the user** about any doubt, and wait.
- Keep changes within the current task's scope. No drive-by refactors.
- Match surrounding code style; keep files small and single-purpose.
- Prices shown to users are **fixed prices**: pricing logic lives server-side in Nitro, is deterministic, and is covered by tests. The client never computes the authoritative price.
- Don't add dependencies without a reason stated in the plan.
- Never commit secrets; use environment variables and a documented `.env.example`.

## Commands

Use Node 26 (`nvm use`, see `.nvmrc`) and pnpm 12.

- `pnpm dev` — dev server
- `pnpm build` / `pnpm preview` — production build / serve it
- `pnpm typecheck` — `nuxt typecheck` (uses TypeScript 6; TS 7 breaks `vue-tsc`, do not upgrade until supported)
- `pnpm test` — Vitest unit/integration (`tests/unit`)
- `pnpm test:e2e` — Playwright (`tests/e2e`; first run needs `pnpm exec playwright install chromium`)
- `pnpm lint` — TBD, no linter chosen yet

pnpm 12 blocks dependency build scripts by default; approve only the specific package needed (`pnpm approve-builds <pkg>`), never `--all`.
