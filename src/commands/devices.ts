import chalk from "chalk"
import inquirer from "inquirer"
import {
  findDevice,
  getCurrentDevice,
  listDevices,
  setCurrentDevice,
  type Device,
} from "../lib/config.js"

const deviceLabel = (device: Device): string =>
  `${device.name ?? "Google TV"}  ${chalk.gray(
    `${device.host}:${device.port ?? 6466}`,
  )}`

const listPairedDevices = (): void => {
  const devices = listDevices()

  if (devices.length === 0) {
    process.stdout.write(chalk.yellow("No TVs paired. Run `gtv pair`.\n"))
    return
  }

  const current = getCurrentDevice()
  for (const device of devices) {
    const marker = device.host === current?.host ? chalk.green("●") : " "
    process.stdout.write(`${marker} ${deviceLabel(device)}\n`)
  }
}

const switchDevice = async (target?: string): Promise<void> => {
  const devices = listDevices()

  if (devices.length === 0) {
    process.stdout.write(chalk.yellow("No TVs paired. Run `gtv pair`.\n"))
    return
  }

  if (target) {
    const match = findDevice(target)
    if (!match) {
      process.stderr.write(
        `${chalk.red("error:")} No paired TV matches "${target}".\n`,
      )
      listPairedDevices()
      process.exitCode = 1
      return
    }
    setCurrentDevice(match.host)
    process.stdout.write(
      chalk.green(`✔ Active TV set to ${match.name ?? "Google TV"}\n`),
    )
    return
  }

  const current = getCurrentDevice()

  if (devices.length === 1) {
    process.stdout.write(`Only one TV paired: ${deviceLabel(devices[0]!)}\n`)
    return
  }

  const { host } = await inquirer.prompt<{ host: string }>([
    {
      type: "list",
      name: "host",
      message: "Switch to which TV?",
      default: current?.host,
      choices: devices.map((device) => ({
        name: deviceLabel(device),
        value: device.host,
      })),
    },
  ])

  setCurrentDevice(host)
  const selected = devices.find((device) => device.host === host)!
  process.stdout.write(
    chalk.green(`✔ Active TV set to ${selected.name ?? "Google TV"}\n`),
  )
}

export { switchDevice, listPairedDevices }
