import { readPreferences, writePreferences } from "@kud/gtv"

// Icon style is a TUI-only concern, so it lives in the CLI — a typed view over
// @kud/gtv's opaque preferences bag, not part of the headless core.
type IconStyle = "nerd" | "emoji" | "text"

const DEFAULT_ICON_STYLE: IconStyle = "text"
const ICON_STYLES: IconStyle[] = ["text", "nerd", "emoji"]

const isIconStyle = (value: unknown): value is IconStyle =>
  typeof value === "string" && ICON_STYLES.includes(value as IconStyle)

const readIconStyle = (): IconStyle => {
  const stored = readPreferences()["iconStyle"]
  return isIconStyle(stored) ? stored : DEFAULT_ICON_STYLE
}

const writeIconStyle = (iconStyle: IconStyle): void => {
  writePreferences({ iconStyle })
}

export { readIconStyle, writeIconStyle, DEFAULT_ICON_STYLE, type IconStyle }
