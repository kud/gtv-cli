# Changelog

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
