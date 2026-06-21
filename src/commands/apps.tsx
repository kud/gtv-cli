import React, { useState } from "react"
import { render, useApp, useInput } from "ink"
import chalk from "chalk"
import { launchApp, findApp, appLink, type AppEntry } from "@kud/gtv"
import { enabledApps } from "../lib/preferences.js"
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
  const { exit } = useApp()

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor((c) => (c - 1 + apps.length) % apps.length)
    } else if (key.downArrow) {
      setCursor((c) => (c + 1) % apps.length)
    } else if (key.return) {
      onPick(apps[cursor]!)
      exit()
    } else if (key.escape || (key.ctrl && input === "c")) {
      onPick(null)
      exit()
    }
  })

  return <AppLauncher width={40} cursor={cursor} apps={apps} />
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
