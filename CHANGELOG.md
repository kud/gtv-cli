# Changelog

## Unreleased — 2026-07-12

### Highlights

- **App launcher catalog grows from 10 to 19 apps.** The core `@kud/gtv` dependency was bumped to 0.2.0, adding nine new apps to both the `apps` launcher and the `app` command: Apple TV, Crunchyroll, Paramount+, Peacock, YouTube Music, Jellyfin, Kodi, VLC, and Deezer. ([2055e90](https://github.com/kud/gtv-cli/commit/2055e90e2f6079ab5fbd54aa8f6881b1ed2a8acf))

## v0.5.0 — 2026-07-12

### Highlights

- **App launcher now has fuzzy search.** Press `/` while browsing apps — in both the in-app launcher and the standalone `gtv apps` picker — to type-filter the list live. A lightweight subsequence matcher ranks consecutive and start-of-name hits highest, so `nf` finds Netflix and `yt` finds YouTube without typing the full name. ([1ce9e3e](https://github.com/kud/gtv-cli/commit/1ce9e3edd46105163d35e28d12f0c5c55a56a8fe))
- **Preferences panel is easier to navigate.** Left/Right arrows now switch between the General and Apps categories (Tab still works too), freeing Up/Down to move the cursor within the active category instead of double-booking them. ([1ce9e3e](https://github.com/kud/gtv-cli/commit/1ce9e3edd46105163d35e28d12f0c5c55a56a8fe))
- **Icon style simplified.** The emoji icon option has been dropped, leaving Nerd Font glyphs and plain text — one less choice that could throw off terminal alignment. Remote buttons and section dividers also got a small visual polish (rounded borders, quieter rule lines). ([1ce9e3e](https://github.com/kud/gtv-cli/commit/1ce9e3edd46105163d35e28d12f0c5c55a56a8fe))

### Fixes

- **`gtv --version` now reports the real installed version** instead of a hardcoded `0.1.0` left over from early development — it's read straight from `package.json` at runtime. ([1ce9e3e](https://github.com/kud/gtv-cli/commit/1ce9e3edd46105163d35e28d12f0c5c55a56a8fe))

## v0.4.1 - 2026-07-10

### Highlights

- **Pairing now connects reliably.** `gtv pair` was dialling the mDNS `.local` hostname, which could resolve to a scopeless IPv6 link-local address that never routes — pairing would fail with `EHOSTUNREACH` even though the TV was right there on the network. It now dials the resolved IPv4 address instead. ([145b174](https://github.com/kud/gtv-cli/commit/145b174ee3465651b1588c7cf7c848c1d126d9ee))
- **Failures now fail cleanly.** A command that errors out prints one clear message instead of a raw Node.js stack trace. ([145b174](https://github.com/kud/gtv-cli/commit/145b174ee3465651b1588c7cf7c848c1d126d9ee))
- **`@kud/gtv` bumped to 0.1.3**, bringing the same fix upstream plus a retry for pairing attempts against TVs dozing in Wi-Fi power-save, and IPv4-pinned connections throughout.

<details>
<summary>Internal (4 commits)</summary>

- CI actions bumped to v5 and Node to 24 ([9c5cc36](https://github.com/kud/gtv-cli/commit/9c5cc364146e148a26d162ea613c291aaaee63d1)), plus docs index and title tidy-ups.

</details>

## v0.4.0 - 2026-06-22

### Highlights

- **Reorderable apps in Preferences.** In the Preferences → Apps panel, Shift+↑/↓ moves an app up or down the list. The chosen order is persisted and now drives the order apps appear in the launcher, so the apps you reach for most often can sit at the top. ([f17662b](https://github.com/kud/gtv-cli/commit/f17662be3154b971d218228dc009f24ffa428f5d))
- **New `gtv prefs` command.** Opens the full Preferences panel — icon style, app visibility, and app order — directly from the shell, without needing a paired TV. Useful for setting up preferences before connecting, or when no TV is handy. ([f17662b](https://github.com/kud/gtv-cli/commit/f17662be3154b971d218228dc009f24ffa428f5d))

---

## v0.3.2 - 2026-06-21

- Refreshed the README with clearer copy, current command examples, and a TUI preview so new users can quickly understand how `gtv` controls Google TV from the terminal.
