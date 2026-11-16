# Habico

## Repository layout

- `webapp/` — Next.js web app. Run npm commands from this folder.
- `hardware/` — Embedded Rust firmware for the ESP32-C6, one Cargo project per folder.
  - `test-load-cell/` — Prototype that reads a load cell through an HX711 and logs grams over RTT.

## webapp

### This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `webapp/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## hardware

- Run `cargo` from inside the project folder, not with `--manifest-path` from the repo root. Cargo only picks up `.cargo/config.toml` (target `riscv32imac-unknown-none-elf`, `build-std`, probe-rs runner) and `rust-toolchain.toml` from the current directory, so the build fails otherwise.
- `no_std` / `no_main` with `esp-hal`; logging goes through `defmt` over RTT.
- Verify changes with `cargo clippy --release`. `cargo run --release` flashes and runs on a connected board via probe-rs.
- Avoid strapping pins GPIO4, 5, 8, 9 and 15. GPIO24–30 belong to the module's flash and must not be used.
