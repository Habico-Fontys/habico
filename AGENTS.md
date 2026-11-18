# Habico

## Repository layout

- `webapp/` — Next.js web app. Run npm commands from this folder.
- `hardware/` — Embedded Rust firmware for the ESP32-C6, one Cargo project per folder.
  - `test-load-cell/` — Prototype that reads a load cell through an HX711 and logs grams over RTT.

## webapp

### This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `webapp/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

### Commands (run from `webapp/`)

- Typecheck: `npx tsc --noEmit` (verified)
- Lint: `npm run lint` (verified; currently reports existing errors)
- Build: `npm run build` (verified)
- Tests: `npm test` (Vitest; verified)

### Code structure

- For new or refactored routes, keep `page.tsx` focused on composing UI and connecting state; keep calculations and storage logic outside it.
- For multi-file route features, use route-local `_components/`, `_hooks/` and `_lib/` folders for UI, hooks and pure helpers. Existing features also keep route data in `data.ts`.
- Components receive data and callbacks through props. Keep calculations pure in `_lib/`; add unit tests when a test runner is configured. The ~30-line limit applies to logic; presentational components may be longer, but split them when they contain more than one section.
- Add `"use client"` only to files that use React state/effects or browser APIs.
- Extract duplicated logic when changing it in more than one place; don't expand the scope of an unrelated change.

### Conventions

- Use Dutch for new domain names and English for technical names such as hooks.
- For new persistent browser data, use `useLocalStorageValue` with a validator; don't add direct `localStorage` access.
- Use or add Tailwind `@theme` tokens in `app/globals.css` instead of adding literal hex colors to component classes.
- Animations must respect `prefers-reduced-motion`; preserve existing `aria-*` and screen-reader-only content when editing markup.
- Use stable item IDs as list keys when available; use an index only for fixed-position data without an ID.
- Add comments only to explain non-obvious reasons; don't add setup instructions or conversational comments.

### Working rules

- Make the smallest change that completes the task. Don't make unrelated refactors or add dependencies without asking.
- Refactors must preserve behavior and rendered markup. Stop and ask before proceeding if either must change.
- Run typecheck, lint and build after each change. Fix failures introduced by the change; report pre-existing failures without unrelated fixes.
- End with a summary of changes and what was deliberately not done.

## hardware

- Run `cargo` from inside the project folder, not with `--manifest-path` from the repo root. Cargo only picks up `.cargo/config.toml` (target `riscv32imac-unknown-none-elf`, `build-std`, probe-rs runner) and `rust-toolchain.toml` from the current directory, so the build fails otherwise.
- `no_std` / `no_main` with `esp-hal`; logging goes through `defmt` over RTT.
- Verify changes with `cargo clippy --release`. `cargo run --release` flashes and runs on a connected board via probe-rs.
- Avoid strapping pins GPIO4, 5, 8, 9 and 15. GPIO24–30 belong to the module's flash and must not be used.
