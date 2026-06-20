<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![npm](https://img.shields.io/npm/v/@kud/gtv-cli?style=flat-square&color=CB3837)
![MIT](https://img.shields.io/badge/licence-MIT-22C55E?style=flat-square)

**Control your Google TV from the terminal via the Android TV Remote v2 protocol**

<a href="https://kud.io">Website</a> · <a href="https://kud.io/projects/gtv-cli/docs">Documentation</a>

</div>

## Features

- **Fullscreen TUI remote** — pair on first run; subsequent launches open an interactive Ink remote directly, no extra steps
- **Keyboard typing** — press `Tab` to enter keyboard mode and type directly into TV text fields (e.g. YouTube search) via IME text injection; text input the Android TV Remote protocol would otherwise leave inaccessible
- **Multiple TVs** — pair as many devices as you like and switch between them with `gtv switch` or browse them with `gtv devices`
- **Responsive layout** — the two-column remote adapts automatically to your terminal width
- **Icon styles** — choose between text, Nerd Font, or emoji icons via an in-app Preferences modal (press `o`)
- **One-shot commands** — send individual key presses, media controls, or deep-link app launches straight from the shell without opening the TUI
- **Network discovery** — find Google TV devices on the local network via mDNS; check device health with `gtv status` or `gtv doctor`

## Install

```sh
npm install -g @kud/gtv-cli
```

Requires Node.js ≥ 22.

## Usage

```console
$ gtv                   # open the remote (pairs on first run)
$ gtv pair / unpair
$ gtv discover --select
$ gtv switch [name]
$ gtv devices
$ gtv status / doctor
$ gtv home / back / up / down / left / right / select
$ gtv vol up|down|mute
$ gtv key <name>
$ gtv app https://www.netflix.com/
```

Inside the TUI: arrow keys and Enter navigate the remote buttons; `Tab` switches to keyboard mode for text input; `o` opens the Preferences modal (icon style, active device); `q` quits.

## Development

```sh
git clone https://github.com/kud/gtv-cli.git
cd gtv-cli
npm install
npm run dev          # run from source with tsx
npm run typecheck    # type-check without emitting
npm run build        # compile to dist/ via tsup
```

📚 **Full documentation → [gtv-cli/docs](https://kud.io/projects/gtv-cli/docs)**
