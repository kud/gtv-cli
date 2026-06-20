# gtv-cli

Control your Google TV from the terminal with the Android TV Remote protocol.

## Features

- **Pair-on-first-run** - run `gtv`, pair once, then jump straight into the remote.
- **Fullscreen remote** - Ink-powered alternate-screen interface centred in your terminal.
- **One-shot controls** - send common keys like `home`, `back`, `select`, volume, and media controls directly from the CLI.
- **Device discovery** - find Google TV devices on the local network via mDNS.
- **Multiple TVs** - pair several Google TVs and switch the active one with `gtv switch`.
- **Health checks** - inspect saved pairing, discovery, and protocol connectivity with `gtv status` or `gtv doctor`.

## Quick Start

```console
npm install -g @kud/gtv-cli
gtv
```

On first launch, `gtv` asks whether to pair a TV. Type the PIN shown on the TV into the terminal, press Enter, and the fullscreen remote opens automatically.

## CLI Reference

```console
gtv                 # open the fullscreen remote, pairing first if needed
gtv pair            # pair or re-pair with a Google TV
gtv unpair          # forget one or more saved pairings (multi-select)
gtv unpair --yes    # forget every saved pairing without prompting
gtv devices         # list paired TVs (● marks the active one)
gtv switch          # pick the active TV interactively
gtv switch bedroom  # switch by TV name or host
gtv status          # short status of the active TV plus others paired
gtv doctor          # detailed diagnostics: config, discovery, protocol
gtv discover        # scan the network for Google TV devices
gtv discover --select
```

### Remote Keys

```console
gtv home
gtv back
gtv up
gtv down
gtv left
gtv right
gtv select
gtv power
gtv play
gtv stop
gtv next
gtv prev
gtv fwd
gtv rwd
gtv mute
gtv vol up
gtv vol down
gtv vol mute
gtv key settings
gtv app https://www.netflix.com/
```

## Development

```console
npm install
npm run dev          # run the CLI from source
npm run dev:pair     # run the pairing flow
npm run dev:discover # scan for devices
npm run typecheck
npm run build
```

## Tech Stack

- TypeScript
- React + Ink
- Commander
- androidtv-remote
- tsup

## Notes

Paired TVs are stored in `~/.config/gtv/config.json`. `gtv unpair` removes the local pairing and certificate for the TVs you select; if your TV keeps its own trusted-device entry, remove it from the TV's remote device settings as well. A pre-existing single-TV config is migrated to the multi-TV format automatically on first run.
