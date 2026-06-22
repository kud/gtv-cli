import React, { useState } from "react"
import { useInput } from "ink"
import type { AppEntry } from "@kud/gtv"
import {
  SettingsPanel,
  ICON_STYLE_OPTIONS,
  type PrefCategory,
} from "./settings-panel.js"
import {
  writeIconStyle,
  toggleApp,
  moveApp,
  orderedApps,
  enabledApps,
  type IconStyle,
} from "../lib/preferences.js"

// The interactive Preferences editor, shared by the in-remote panel (opened with
// "o") and the standalone `gtv prefs` command. It owns only the transient UI
// state — the active tab and cursor row — while the data it edits (icon style,
// app visibility, app order) is lifted to the caller so the remote can react to
// changes live. onStatus is optional: the remote feeds it the status bar; the
// standalone command has nowhere to show it.
const Preferences = ({
  width,
  iconStyle,
  setIconStyle,
  enabledIds,
  setEnabledIds,
  apps,
  setApps,
  onExit,
  onStatus,
}: {
  width: number
  iconStyle: IconStyle
  setIconStyle: (style: IconStyle) => void
  enabledIds: string[]
  setEnabledIds: (ids: string[]) => void
  apps: AppEntry[]
  setApps: (apps: AppEntry[]) => void
  onExit: () => void
  onStatus?: (message: string) => void
}) => {
  const [category, setCategory] = useState<PrefCategory>("general")
  const [cursor, setCursor] = useState(() =>
    Math.max(
      0,
      ICON_STYLE_OPTIONS.findIndex((option) => option.value === iconStyle),
    ),
  )

  useInput((input, key) => {
    if (key.escape) {
      onExit()
      return
    }
    if (key.tab) {
      setCategory((c) => (c === "general" ? "apps" : "general"))
      setCursor(0)
      return
    }

    if (category === "general") {
      if (key.upArrow) {
        setCursor(
          (c) =>
            (c - 1 + ICON_STYLE_OPTIONS.length) % ICON_STYLE_OPTIONS.length,
        )
        return
      }
      if (key.downArrow) {
        setCursor((c) => (c + 1) % ICON_STYLE_OPTIONS.length)
        return
      }
      if (key.return) {
        const chosen = ICON_STYLE_OPTIONS[cursor]!.value
        writeIconStyle(chosen)
        setIconStyle(chosen)
        onStatus?.(`icons: ${chosen}`)
        onExit()
        return
      }
      return
    }

    // Apps category — reorder, toggle, or move the cursor.
    if (key.shift && (key.upArrow || key.downArrow)) {
      const app = apps[cursor]!
      moveApp(app.id, key.upArrow ? "up" : "down")
      const reordered = orderedApps()
      setApps(reordered)
      setCursor(reordered.findIndex((a) => a.id === app.id))
      onStatus?.(`move: ${app.name}`)
      return
    }
    if (key.upArrow) {
      setCursor((c) => (c - 1 + apps.length) % apps.length)
      return
    }
    if (key.downArrow) {
      setCursor((c) => (c + 1) % apps.length)
      return
    }
    if (input === " ") {
      const app = apps[cursor]!
      toggleApp(app.id)
      setEnabledIds(enabledApps().map((a) => a.id))
      onStatus?.(`toggle: ${app.name}`)
    }
  })

  return (
    <SettingsPanel
      width={width}
      category={category}
      cursor={cursor}
      iconStyle={iconStyle}
      apps={apps}
      enabledIds={enabledIds}
    />
  )
}

export { Preferences }
