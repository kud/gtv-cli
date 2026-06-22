import React, { useState } from "react"
import { render, useApp } from "ink"
import type { AppEntry } from "@kud/gtv"
import { Preferences } from "../components/preferences.js"
import {
  readIconStyle,
  enabledApps,
  orderedApps,
  type IconStyle,
} from "../lib/preferences.js"

// Standalone Preferences editor — the same panel reachable with "o" in the
// remote, launched straight from the shell. It needs no paired TV: every change
// is a local config write, so it sits outside the pairing gate.
const PreferencesApp = () => {
  const { exit } = useApp()
  const [iconStyle, setIconStyle] = useState<IconStyle>(() => readIconStyle())
  const [enabledIds, setEnabledIds] = useState<string[]>(() =>
    enabledApps().map((app) => app.id),
  )
  const [apps, setApps] = useState<AppEntry[]>(() => orderedApps())

  return (
    <Preferences
      width={40}
      iconStyle={iconStyle}
      setIconStyle={setIconStyle}
      enabledIds={enabledIds}
      setEnabledIds={setEnabledIds}
      apps={apps}
      setApps={setApps}
      onExit={exit}
    />
  )
}

const prefs = async (): Promise<void> => {
  const { waitUntilExit } = render(<PreferencesApp />)
  await waitUntilExit()
}

export { prefs }
