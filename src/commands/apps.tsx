import React, { useState } from "react"
import { render, useApp, useInput } from "ink"
import chalk from "chalk"
import { launchApp, findApp, appLink, type AppEntry } from "@kud/gtv"
import { enabledApps } from "../lib/preferences.js"
import { fuzzyFilter } from "../lib/fuzzy.js"
import { AppLauncher } from "../components/app-launcher.js"

// Launch a catalog app by name (e.g. "netflix") or a raw deep link / URL.
const launch = async (target: string): Promise<void> => {
  const app = findApp(target)
  const link = app ? appLink(app) : target
  await launchApp(link)
  process.stdout.write(chalk.green(`✔ Launched ${app?.name ?? link}\n`))
}

// Ink-based picker — reuses the same AppLauncher component as the TUI modal so
// the selection UX is identical whether in the remote or from the shell.
const Picker = ({ onPick }: { onPick: (app: AppEntry | null) => void }) => {
  const apps = enabledApps()
  const [cursor, setCursor] = useState(0)
  const [filter, setFilter] = useState("")
  const [filtering, setFiltering] = useState(false)
  const { exit } = useApp()

  const results = fuzzyFilter(filter, apps, (app) => app.name)

  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      onPick(null)
      exit()
      return
    }
    if (key.escape) {
      // A first Esc backs out of the filter; a second dismisses the picker.
      if (filtering) {
        setFiltering(false)
        setFilter("")
        setCursor(0)
      } else {
        onPick(null)
        exit()
      }
      return
    }
    if (key.return) {
      const app = results[cursor]
      if (app) {
        onPick(app)
        exit()
      }
      return
    }
    if (key.upArrow) {
      if (results.length > 0) {
        setCursor((c) => (c - 1 + results.length) % results.length)
      }
      return
    }
    if (key.downArrow) {
      if (results.length > 0) setCursor((c) => (c + 1) % results.length)
      return
    }
    if (!filtering) {
      if (input === "/") setFiltering(true)
      return
    }
    if (key.backspace || key.delete) {
      setFilter((q) => q.slice(0, -1))
      setCursor(0)
      return
    }
    if (input && !key.tab) {
      setFilter((q) => q + input)
      setCursor(0)
    }
  })

  return (
    <AppLauncher
      width={40}
      cursor={cursor}
      apps={results}
      filtering={filtering}
      query={filter}
    />
  )
}

const appsMenu = async (): Promise<void> => {
  const chosen = await new Promise<AppEntry | null>((resolve) => {
    let picked: AppEntry | null = null
    const { waitUntilExit } = render(
      <Picker onPick={(app) => (picked = app)} />,
    )
    void waitUntilExit().then(() => resolve(picked))
  })
  if (chosen) await launch(chosen.id)
}

export { launch, appsMenu }
