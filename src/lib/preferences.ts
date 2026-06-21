import {
  readPreferences,
  writePreferences,
  listApps,
  type AppEntry,
} from "@kud/gtv"

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

// App visibility — we persist the *disabled* ids so apps added to the catalog
// later default to visible. enabledApps() is what the launcher should show.
const readDisabledApps = (): string[] => {
  const stored = readPreferences()["disabledApps"]
  return Array.isArray(stored)
    ? stored.filter((value): value is string => typeof value === "string")
    : []
}

const isAppEnabled = (id: string): boolean => !readDisabledApps().includes(id)

const toggleApp = (id: string): void => {
  const disabled = new Set(readDisabledApps())
  if (disabled.has(id)) disabled.delete(id)
  else disabled.add(id)
  writePreferences({ disabledApps: [...disabled] })
}

const enabledApps = (): AppEntry[] =>
  listApps().filter((app) => isAppEnabled(app.id))

export {
  readIconStyle,
  writeIconStyle,
  DEFAULT_ICON_STYLE,
  isAppEnabled,
  toggleApp,
  enabledApps,
  type IconStyle,
}
