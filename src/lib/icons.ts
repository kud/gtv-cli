import type { IconStyle } from "./preferences.js"

type IconPair = { nerd: string; emoji: string }

// Nerd Font glyphs are written as \u{} escapes so raw PUA bytes never end up in
// source (editors and diff tools silently mangle them).
const ICONS: Record<string, IconPair> = {
  power: { nerd: "\u{f011}", emoji: "⏻" },
  home: { nerd: "\u{f015}", emoji: "\u{1f3e0}" },
  back: { nerd: "\u{f0e2}", emoji: "↩" },
  settings: { nerd: "\u{f013}", emoji: "⚙" },
  search: { nerd: "\u{f002}", emoji: "\u{1f50d}" },
  up: { nerd: "\u{f077}", emoji: "▲" },
  down: { nerd: "\u{f078}", emoji: "▼" },
  left: { nerd: "\u{f053}", emoji: "◀" },
  right: { nerd: "\u{f054}", emoji: "▶" },
  select: { nerd: "\u{f00c}", emoji: "⏺" },
  play: { nerd: "\u{f04b}", emoji: "⏯" },
  stop: { nerd: "\u{f04d}", emoji: "⏹" },
  next: { nerd: "\u{f051}", emoji: "⏭" },
  prev: { nerd: "\u{f048}", emoji: "⏮" },
  rwd: { nerd: "\u{f049}", emoji: "⏪" },
  fwd: { nerd: "\u{f050}", emoji: "⏩" },
  mute: { nerd: "\u{f026}", emoji: "\u{1f507}" },
  "vol-down": { nerd: "\u{f027}", emoji: "\u{1f509}" },
  "vol-up": { nerd: "\u{f028}", emoji: "\u{1f50a}" },
  input: { nerd: "\u{f0ec}", emoji: "⇄" },
  info: { nerd: "\u{f05a}", emoji: "ℹ" },
  guide: { nerd: "\u{f0ca}", emoji: "☰" },
  "channel-up": { nerd: "\u{f102}", emoji: "⏶" },
  "channel-down": { nerd: "\u{f103}", emoji: "⏷" },
  sleep: { nerd: "\u{f186}", emoji: "\u{1f319}" },
  wakeup: { nerd: "\u{f185}", emoji: "☀" },
  text: { nerd: "\u{f11c}", emoji: "⌨" },
}

const iconFor = (action: string, style: IconStyle): string => {
  if (style === "text") return ""
  const pair = ICONS[action]
  if (!pair) return ""
  return style === "nerd" ? pair.nerd : pair.emoji
}

export { iconFor }
