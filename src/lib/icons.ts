import type { IconStyle } from "./preferences.js"

// Nerd Font glyphs are written as \u{} escapes so raw PUA bytes never end up in
// source (editors and diff tools silently mangle them).
const ICONS: Record<string, string> = {
  power: "\u{f011}",
  home: "\u{f015}",
  back: "\u{f0e2}",
  settings: "\u{f013}",
  search: "\u{f002}",
  up: "\u{f077}",
  down: "\u{f078}",
  left: "\u{f053}",
  right: "\u{f054}",
  select: "\u{f00c}",
  play: "\u{f04b}",
  stop: "\u{f04d}",
  next: "\u{f051}",
  prev: "\u{f048}",
  rwd: "\u{f049}",
  fwd: "\u{f050}",
  mute: "\u{f026}",
  "vol-down": "\u{f027}",
  "vol-up": "\u{f028}",
  input: "\u{f0ec}",
  info: "\u{f05a}",
  guide: "\u{f0ca}",
  "channel-up": "\u{f102}",
  "channel-down": "\u{f103}",
  sleep: "\u{f186}",
  wakeup: "\u{f185}",
  text: "\u{f11c}",
  apps: "\u{f00a}",
}

const iconFor = (action: string, style: IconStyle): string =>
  style === "text" ? "" : (ICONS[action] ?? "")

export { iconFor }
