#!/usr/bin/env node
import { Command } from "commander"
import { render } from "ink"
import React from "react"
import chalk from "chalk"
import { App } from "./app.js"
import { pair } from "./commands/pair.js"
import { discover } from "./commands/discover.js"
import { sendKey, launchApp } from "./lib/client.js"
import { KEYS } from "./lib/keycodes.js"

const program = new Command()
  .name("gtv")
  .description("Control your Google TV")
  .version("0.1.0")

program.command("pair").description("Pair with your Google TV").action(pair)

program
  .command("discover")
  .description("Scan network for Google TV devices")
  .option("-s, --select", "Select and save a TV as default")
  .option("-t, --timeout <ms>", "Scan duration in ms", "5000")
  .action(async (opts: { select?: boolean; timeout: string }) => {
    await discover({ select: opts.select, timeout: parseInt(opts.timeout, 10) })
  })

const key = (name: string) => async (): Promise<void> => {
  const k = KEYS[name]
  if (!k) throw new Error(`Unknown key: ${name}`)
  await sendKey(k)
}

program.command("home").description("Go home").action(key("home"))
program.command("back").description("Go back").action(key("back"))
program.command("up").description("D-pad up").action(key("up"))
program.command("down").description("D-pad down").action(key("down"))
program.command("left").description("D-pad left").action(key("left"))
program.command("right").description("D-pad right").action(key("right"))
program.command("select").description("Select / OK").action(key("select"))
program.command("power").description("Toggle power").action(key("power"))
program.command("play").description("Play / Pause").action(key("play"))
program.command("stop").description("Stop").action(key("stop"))
program.command("next").description("Next track").action(key("next"))
program.command("prev").description("Previous track").action(key("prev"))
program.command("fwd").description("Fast forward").action(key("fwd"))
program.command("rwd").description("Rewind").action(key("rwd"))
program.command("mute").description("Toggle mute").action(key("mute"))
program.command("menu").description("Open menu").action(key("menu"))
program.command("search").description("Open search").action(key("search"))
program.command("input").description("Switch input").action(key("input"))
program.command("sleep").description("Sleep").action(key("sleep"))
program.command("wakeup").description("Wake up").action(key("wakeup"))

program
  .command("vol")
  .argument("<action>", "up, down, or mute")
  .description("Volume control")
  .action(async (action: string) => {
    const keyName =
      action === "up" ? "vol-up" : action === "down" ? "vol-down" : "mute"
    await key(keyName)()
  })

program
  .command("app")
  .argument("<deeplink>", "App deep link URL (e.g. https://www.netflix.com/)")
  .description("Launch an app by deep link")
  .action(launchApp)

program
  .command("key")
  .argument("<name>", "Key name")
  .description(`Send a key by name. Available: ${Object.keys(KEYS).join(", ")}`)
  .action(async (name: string) => {
    const keyCode = KEYS[name]
    if (!keyCode) {
      process.stderr.write(
        `${chalk.red("error:")} Unknown key "${name}". Available: ${Object.keys(KEYS).join(", ")}\n`,
      )
      process.exit(1)
    }
    await sendKey(keyCode)
  })

if (process.argv.length <= 2) {
  render(<App />)
} else {
  await program.parseAsync(process.argv)
}
