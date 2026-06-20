import chalk from "chalk"
import { discover } from "./discover.js"
import { connect } from "../lib/client.js"
import { CONFIG_PATH, listDevices, readConfig } from "../lib/config.js"
import { silenceRemoteConsole, stopRemote } from "../lib/remote.js"

const label = (name: string, value: string, marker = "") =>
  `  ${chalk.gray(name.padEnd(12))}${value}${marker ? ` ${marker}` : ""}\n`

const ok = chalk.green("●")
const warn = chalk.yellow("●")
const fail = chalk.red("●")

const testConnection = async (): Promise<
  { ok: true } | { ok: false; message: string }
> => {
  const restoreConsole = silenceRemoteConsole()

  try {
    const remote = await connect()
    stopRemote(remote)
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    }
  } finally {
    restoreConsole()
  }
}

const status = async (): Promise<void> => {
  process.stdout.write(chalk.bold("Google TV\n\n"))

  const config = readConfig()
  if (!config) {
    process.stdout.write(label("Status", "not paired", fail))
    process.stdout.write(label("Next", "run `gtv` to pair and open the remote"))
    return
  }

  const connection = await testConnection()
  process.stdout.write(label("TV", config.name ?? "Google TV"))
  process.stdout.write(
    label("Address", `${config.host}:${config.port ?? 6466}`),
  )
  process.stdout.write(
    label(
      "Remote",
      connection.ok ? "connected" : "not reachable",
      connection.ok ? ok : fail,
    ),
  )

  const others = listDevices().filter((device) => device.host !== config.host)
  if (others.length > 0) {
    process.stdout.write(
      label(
        "Others",
        others.map((device) => device.name ?? device.host).join(", "),
      ),
    )
    process.stdout.write(label("Switch", "run `gtv switch` to change TV"))
  }
}

const doctor = async (): Promise<void> => {
  process.stdout.write(chalk.bold("Google TV doctor\n\n"))

  const config = readConfig()
  if (!config) {
    process.stdout.write(label("Config", `missing (${CONFIG_PATH})`, fail))
    process.stdout.write(label("Next", "run `gtv` to pair and open the remote"))
    process.exitCode = 1
    return
  }

  process.stdout.write(label("Config", config.name ?? "Google TV", ok))
  process.stdout.write(
    label("Address", `${config.host}:${config.port ?? 6466}`, ok),
  )
  process.stdout.write(
    label(
      "Certificate",
      config.cert ? "present" : "missing",
      config.cert ? ok : fail,
    ),
  )

  const devices = await discover({ timeout: 2500, quiet: true })
  const matchingDevice = devices.find((device) => device.host === config.host)

  if (matchingDevice) {
    const sameDetails =
      matchingDevice.name === (config.name ?? "Google TV") &&
      matchingDevice.host === config.host &&
      matchingDevice.port === (config.port ?? 6466)

    process.stdout.write(
      label(
        "Discovery",
        sameDetails
          ? "found on network"
          : `found ${matchingDevice.name} at ${matchingDevice.host}:${matchingDevice.port}`,
        ok,
      ),
    )
  } else if (devices.length > 0) {
    process.stdout.write(
      label(
        "Discovery",
        `found ${devices.length} TV(s), but not ${config.host}`,
        warn,
      ),
    )
    for (const device of devices) {
      process.stdout.write(
        label("Nearby", `${device.name} at ${device.host}:${device.port}`),
      )
    }
  } else {
    process.stdout.write(label("Discovery", "not found via mDNS", warn))
  }

  const connection = await testConnection()
  if (connection.ok) {
    process.stdout.write(label("Protocol", "connected", ok))
  } else {
    process.stdout.write(label("Protocol", connection.message, fail))
    process.exitCode = 1
  }
}

export { status, doctor }
