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

// App order — we persist an explicit list of ids. Every read reconciles it
// against the live catalog: ids no longer in the catalog are dropped, and
// catalog apps missing from the saved order are appended, so a newly added app
// surfaces at the end instead of vanishing.
const readAppOrder = (): string[] => {
  const stored = readPreferences()["appOrder"]
  return Array.isArray(stored)
    ? stored.filter((value): value is string => typeof value === "string")
    : []
}

const orderedApps = (): AppEntry[] => {
  const catalog = listApps()
  const byId = new Map(catalog.map((app) => [app.id, app]))
  const ordered = readAppOrder()
    .map((id) => byId.get(id))
    .filter((app): app is AppEntry => app !== undefined)
  const placed = new Set(ordered.map((app) => app.id))
  const appended = catalog.filter((app) => !placed.has(app.id))
  return [...ordered, ...appended]
}

const moveApp = (id: string, direction: "up" | "down"): void => {
  const ids = orderedApps().map((app) => app.id)
  const index = ids.indexOf(id)
  const target = direction === "up" ? index - 1 : index + 1
  if (index === -1 || target < 0 || target >= ids.length) return
  const reordered = [...ids]
  reordered[index] = ids[target]!
  reordered[target] = ids[index]!
  writePreferences({ appOrder: reordered })
}

const enabledApps = (): AppEntry[] =>
  orderedApps().filter((app) => isAppEnabled(app.id))

export {
  readIconStyle,
  writeIconStyle,
  DEFAULT_ICON_STYLE,
  isAppEnabled,
  toggleApp,
  orderedApps,
  moveApp,
  enabledApps,
  type IconStyle,
}
