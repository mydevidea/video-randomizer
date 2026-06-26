# RanDrop

A fast desktop tool for bulk-uploading videos to Facebook or other platforms via drag & drop.

## What it does

- Scans one or more folders (recursively) for video files
- Displays a random batch of N videos at once
- Drag the entire batch into Facebook's upload area — all videos in one drag
- Batch auto-refreshes with the next random set after each drag
- No duplicates within a cycle — every video shown exactly once before reshuffling
- Remembers your folders, settings, and position between sessions

## Supported formats

`.mp4` `.mkv` `.mov` `.avi` `.webm` `.m4v`

## Dev setup

```bash
pnpm install
pnpm tauri dev
```

## Build for macOS (on macOS)

```bash
pnpm tauri build
```

Output: `src-tauri/target/release/bundle/macos/` and `.dmg`

---

## Build for Windows from macOS

Cross-compiling a full Tauri `.exe`/`.msi` from macOS is **not officially supported** by Tauri. The recommended approaches are:

### Option 1: GitHub Actions (recommended — free)

Create `.github/workflows/build-windows.yml`:

```yaml
name: Build Windows
on: workflow_dispatch

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - uses: dtolnay/rust-toolchain@stable
      - run: pnpm install
      - run: pnpm tauri build
      - uses: actions/upload-artifact@v4
        with:
          name: windows-build
          path: src-tauri/target/release/bundle/
```

Push to GitHub → Actions tab → Run workflow → download the artifact `.msi` / `.exe`.

### Option 2: Windows VM / machine

Run `pnpm tauri build` on any Windows machine with Rust + Node installed.

### Option 3: Cross-compile via Docker (advanced, no `.msi` installer)

```bash
# Install cross-compilation target
rustup target add x86_64-pc-windows-msvc

# Use cargo-xwin (handles MSVC SDK automatically)
cargo install cargo-xwin

# Build the Rust binary only (no installer)
cd src-tauri
cargo xwin build --release --target x86_64-pc-windows-msvc
```

This produces the `.exe` but **not** the `.msi` installer. Use Option 1 for a proper installer.

---

## Settings

| Setting | Default | Description |
|---|---|---|
| Videos per batch | 7 | How many videos shown at once (1–50) |
| Folders | — | Add multiple folders, all scanned recursively |

## Tech stack

- [Tauri v2](https://tauri.app) — Rust backend
- [Vue 3](https://vuejs.org) — Composition API + TypeScript
- [Pinia](https://pinia.vuejs.org) — state management
- [TailwindCSS v4](https://tailwindcss.com) — styling
- [@lucide/vue](https://lucide.dev) — icons
- [tauri-plugin-store](https://github.com/tauri-apps/plugins-workspace) — persistent JSON storage
