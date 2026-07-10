import inquirer from "inquirer"
import ora from "ora"
import chalk from "chalk"
import { pair as pairDevice } from "@kud/gtv"
import { discover } from "./discover.js"
import type { DiscoveredDevice } from "./discover.js"

const pairWithDevice = async (device: {
  host: string
  hostname: string
  port?: number
  name?: string
}): Promise<void> => {
  const spinner = ora("Connecting to TV…").start()

  await pairDevice({
    host: device.host,
    // Dial the resolved IPv4, not the mDNS ".local" name: the hostname expands
    // to a scopeless IPv6 link-local that routes to loopback and never connects.
    hostname: device.host,
    port: device.port,
    name: device.name ?? "gtv",
    serviceName: "gtv-cli",
    onStatus: (status) => {
      if (status === "pairing") spinner.start("Pairing…")
      else if (status === "paired")
        spinner.succeed("Paired! Config saved to ~/.config/gtv/config.json")
    },
    onSecret: async () => {
      spinner.stop()
      process.stdout.write(
        chalk.cyan(
          "A PIN is now shown on your TV. Type that PIN here in the terminal, then press Enter.\n",
        ),
      )
      const { pin } = await inquirer.prompt<{ pin: string }>([
        { type: "input", name: "pin", message: "TV PIN:" },
      ])
      return pin
    },
  }).catch((error: Error) => {
    spinner.fail(error.message)
    // The spinner already surfaced this; flag it so the top-level handler in
    // index.tsx exits non-zero without printing the message a second time.
    ;(error as { handled?: boolean }).handled = true
    throw error
  })
}

const pair = async (): Promise<void> => {
  const devices = await discover({ timeout: 4000 })

  if (devices.length === 0) {
    process.stdout.write(
      chalk.yellow("No devices found via mDNS. Enter IP manually.\n"),
    )
    const { host } = await inquirer.prompt<{ host: string }>([
      { type: "input", name: "host", message: "TV IP address:" },
    ])
    await pairWithDevice({ host, hostname: host })
    return
  }

  if (devices.length === 1) {
    await pairWithDevice(devices[0]!)
    return
  }

  const choices = [
    ...devices.map((d: DiscoveredDevice) => ({
      name: `${d.name}  (${d.host})`,
      value: d,
    })),
    { name: "Enter IP manually", value: null },
  ]

  const { device } = await inquirer.prompt<{ device: DiscoveredDevice | null }>(
    [
      {
        type: "list",
        name: "device",
        message: "Which TV to pair with?",
        choices,
      },
    ],
  )

  if (!device) {
    const { host } = await inquirer.prompt<{ host: string }>([
      { type: "input", name: "host", message: "TV IP address:" },
    ])
    await pairWithDevice({ host, hostname: host })
    return
  }

  await pairWithDevice(device)
}

export { pair }
