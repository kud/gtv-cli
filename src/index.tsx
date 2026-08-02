#!/usr/bin/env node
import { readFileSync } from "node:fs"
import { Command } from "commander"
import { render } from "ink"
import React from "react"
import chalk from "chalk"
import inquirer from "inquirer"
import { App, SCREENS, type Screen } from "./app.js"
import { pair } from "./commands/pair.js"
import { discover } from "./commands/discover.js"
import { doctor, status } from "./commands/status.js"
import { debug } from "./commands/debug.js"
import { switchDevice, listPairedDevices } from "./commands/devices.js"
import { launch, appsMenu } from "./commands/apps.js"
import { prefs } from "./commands/prefs.js"
import {
  sendKey,
  listDevices,
  readConfig,
  removeDevices,
  setDebug,
  KEYS,
} from "@kud/gtv"

// Read the version from package.json so the CLI never drifts from the release.
// Resolves from both src/ (dev) and dist/ (published) — each is one level under root.
const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string }

const program = new Command()
  .name("gtv")
  .description("Control your Google TV")
  .version(version)
  .option("-d, --debug", "Stream verbose protocol logs")

// A global --debug turns on the library's protocol logging for any command.
program.hook("preAction", () => {
  if (program.opts()["debug"]) setDebug(true)
})

program
  .command("pair")
  .description("Pair or re-pair with your Google TV")
  .action(pair)

program
  .command("unpair")
  .description("Forget the saved Google TV pairing")
  .option("-y, --yes", "Unpair without prompting")
  .action(async (opts: { yes?: boolean }) => {
    const paired = listDevices()

    if (paired.length === 0) {
      process.stdout.write(chalk.yellow("No saved Google TV pairing found.\n"))
      return
    }

    const current = readConfig()

    if (opts.yes) {
      const hosts = paired.map((device) => device.host)
      removeDevices(hosts)
      process.stdout.write(chalk.green(`Unpaired ${hosts.length} TV(s).\n`))
      return
    }

    const { hosts } = await inquirer.prompt<{ hosts: string[] }>([
      {
        type: "checkbox",
        name: "hosts",
        message: "Which pairing(s) should be removed?",
        choices: paired.map((device) => ({
          name: `${device.name ?? "Google TV"}  ${chalk.gray(`${device.host}:${device.port ?? 6466}`)}`,
          value: device.host,
          checked: device.host === current?.host,
        })),
      },
    ])

    if (hosts.length === 0) {
      process.stdout.write(chalk.yellow("Unpair cancelled.\n"))
      return
    }

    removeDevices(hosts)
    process.stdout.write(chalk.green(`Unpaired ${hosts.length} TV(s).\n`))
  })

program
  .command("discover")
  .description("Scan network for Google TV devices")
  .option("-s, --select", "Select and save a TV as default")
  .option("-t, --timeout <ms>", "Scan duration in ms", "5000")
  .action(async (opts: { select?: boolean; timeout: string }) => {
    await discover({ select: opts.select, timeout: parseInt(opts.timeout, 10) })
  })

program
  .command("status")
  .description("Check Google TV pairing and connectivity")
  .action(status)
program
  .command("doctor")
  .description("Run detailed Google TV diagnostics")
  .action(doctor)

program
  .command("debug")
  .description("Stream live protocol logs (open a TV text field to see IME)")
  .action(debug)

program
  .command("devices")
  .description("List paired Google TVs")
  .action(listPairedDevices)

program
  .command("switch")
  .argument("[device]", "TV name or host to make active")
  .description("Switch the active Google TV")
  .action(switchDevice)

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
  .argument("<name|url>", "App name (e.g. netflix) or a deep link / URL")
  .description("Launch an app by name or deep link")
  .action(launch)

program
  .command("apps")
  .description("Pick an app to launch from a menu")
  .action(appsMenu)

program
  .command("prefs")
  .description("Edit preferences: icon style, app visibility and order")
  .action(prefs)

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

const ensurePaired = async (): Promise<boolean> => {
  if (readConfig()) return true

  const { shouldPair } = await inquirer.prompt<{ shouldPair: boolean }>([
    {
      type: "confirm",
      name: "shouldPair",
      message: "No Google TV is paired yet. Pair one now?",
      default: true,
    },
  ])

  if (!shouldPair) return false

  await pair()
  return Boolean(readConfig())
}

// The cli-shot contract, read from argv rather than declared on commander:
// the remote opens on a bare invocation, which commander never sees. --screen
// takes a value, so the name after it is discounted too when deciding whether
// an invocation is bare — counting only the flag would send `gtv --screen apps`
// down the subcommand path as an unknown command.
const screenAt = process.argv.indexOf("--screen")
const requestedScreen = screenAt === -1 ? undefined : process.argv[screenAt + 1]
const mock = process.argv.includes("--mock")

if (requestedScreen === "list") {
  console.log(SCREENS.join("\n"))
  process.exit(0)
}

if (
  requestedScreen !== undefined &&
  !SCREENS.includes(requestedScreen as Screen)
) {
  console.error(
    `Unknown screen "${requestedScreen}". Available: ${SCREENS.join(", ")}`,
  )
  process.exit(1)
}

const invokedBare =
  process.argv.filter(
    (arg, i) =>
      arg !== "--mock" &&
      arg !== "--screen" &&
      process.argv[i - 1] !== "--screen",
  ).length <= 2

const run = async (): Promise<void> => {
  if (invokedBare) {
    // No pairing needed in mock mode — that is most of the point.
    if (!mock && !(await ensurePaired())) process.exit(0)
    render(
      <App initialScreen={requestedScreen as Screen | undefined} mock={mock} />,
      { alternateScreen: true },
    )
  } else {
    await program.parseAsync(process.argv)
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  // Commands that already reported the failure (e.g. pair, via its spinner)
  // mark it handled; everything else prints one clean line, never a stack trace.
  const alreadyShown =
    error instanceof Error && (error as { handled?: boolean }).handled
  if (!alreadyShown) process.stderr.write(chalk.red(`error: ${message}\n`))
  process.exit(1)
})
