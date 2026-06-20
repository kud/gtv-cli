import { AndroidRemote } from "androidtv-remote"
import inquirer from "inquirer"
import ora from "ora"
import chalk from "chalk"
import { upsertDevice } from "../lib/config.js"
import { silenceRemoteConsole, stopRemote } from "../lib/remote.js"
import { discover, type DiscoveredDevice } from "./discover.js"

const pairWithDevice = async (device: {
  host: string
  hostname: string
  port?: number
  name?: string
}): Promise<void> => {
  const spinner = ora("Connecting to TV…").start()
  const restoreConsole = silenceRemoteConsole()

  const remote = new AndroidRemote(device.hostname, {
    pairing_port: 6467,
    service_name: "gtv-cli",
  })

  await new Promise<void>((resolve, reject) => {
    const fail = (msg: string) => {
      spinner.fail(msg)
      try {
        stopRemote(remote)
      } catch {}
      restoreConsole()
      reject(new Error(msg))
    }

    remote.on("secret", async () => {
      spinner.stop()
      process.stdout.write(
        chalk.cyan(
          "A PIN is now shown on your TV. Type that PIN here in the terminal, then press Enter.\n",
        ),
      )
      const { pin } = await inquirer.prompt<{ pin: string }>([
        { type: "input", name: "pin", message: "TV PIN:" },
      ])
      remote.sendCode(pin)
      spinner.start("Pairing…")
    })

    remote.on("ready", () => {
      const cert = remote.getCertificate()
      upsertDevice({
        host: device.host,
        port: device.port,
        name: device.name ?? "gtv-cli",
        cert: cert as { key: string; cert: string },
      })
      spinner.succeed("Paired! Config saved to ~/.config/gtv/config.json")
      try {
        stopRemote(remote)
      } catch {}
      restoreConsole()
      resolve()
    })

    remote.on("unpaired", () => fail("TV rejected the pairing request."))
    remote.on("error", (err: Error) => fail(err.message))

    remote
      .start()
      .then((paired) => {
        if (!paired)
          fail(
            "Could not connect to TV. Check that 'Remote Device Settings → Control remotely' is enabled.",
          )
      })
      .catch((err: Error) => fail(err.message))
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
