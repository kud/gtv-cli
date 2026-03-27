import { spawn } from "node:child_process"
import dns from "node:dns/promises"
import ora from "ora"
import chalk from "chalk"
import inquirer from "inquirer"
import { writeConfig, readConfig } from "../lib/config.js"

type DiscoveredDevice = {
  name: string
  host: string
  hostname: string
  port: number
}

const browseServices = (timeout: number): Promise<string[]> =>
  new Promise((resolve) => {
    const names: string[] = []
    const proc = spawn("dns-sd", ["-B", "_androidtvremote2._tcp", "local"])

    proc.stdout.on("data", (data: Buffer) => {
      for (const line of data.toString().split("\n")) {
        const match = line.match(
          /Add\s+\d+\s+\d+\s+\S+\s+_androidtvremote2\._tcp\.\s+(.+)$/,
        )
        if (match) names.push(match[1].trim())
      }
    })

    setTimeout(() => {
      proc.kill()
      resolve([...new Set(names)])
    }, timeout)
  })

const resolveService = (
  name: string,
): Promise<{ hostname: string; port: number } | null> =>
  new Promise((resolve) => {
    const proc = spawn("dns-sd", [
      "-L",
      name,
      "_androidtvremote2._tcp",
      "local",
    ])
    let output = ""

    proc.stdout.on("data", (data: Buffer) => {
      output += data.toString()
      const match = output.match(/can be reached at ([^:]+):(\d+)/)
      if (match) {
        proc.kill()
        resolve({ hostname: match[1], port: parseInt(match[2], 10) })
      }
    })

    setTimeout(() => {
      proc.kill()
      resolve(null)
    }, 3000)
  })

const discover = async (
  opts: { timeout?: number; select?: boolean } = {},
): Promise<DiscoveredDevice[]> => {
  const timeout = opts.timeout ?? 5000
  const spinner = ora("Scanning for Google TV devices…").start()

  const names = await browseServices(timeout)

  if (names.length === 0) {
    spinner.fail("No Google TV devices found on the network.")
    return []
  }

  spinner.text = `Resolving ${names.length} device(s)…`

  const resolved = await Promise.all(
    names.map(async (name) => {
      const service = await resolveService(name)
      if (!service) return null

      const { address } = await dns.lookup(service.hostname, { family: 4 })
      return {
        name,
        host: address,
        hostname: service.hostname,
        port: service.port,
      } satisfies DiscoveredDevice
    }),
  )

  const found = resolved.filter((d): d is DiscoveredDevice => d !== null)

  if (found.length === 0) {
    spinner.fail("Found devices but could not resolve their addresses.")
    return []
  }

  spinner.succeed(`Found ${found.length} device(s):`)
  found.forEach((d) => {
    process.stdout.write(
      `  ${chalk.cyan(d.name)}  ${chalk.gray(`${d.host}:${d.port}`)}\n`,
    )
  })

  if (opts.select) {
    const existing = readConfig()

    const selected =
      found.length === 1
        ? found[0]!
        : await inquirer
            .prompt<{ device: string }>([
              {
                type: "list",
                name: "device",
                message: "Which TV do you want to use?",
                choices: found.map((d) => ({
                  name: `${d.name}  (${d.host})`,
                  value: d.host,
                })),
                default: existing?.host,
              },
            ])
            .then(({ device }) => found.find((d) => d.host === device)!)

    writeConfig({ ...existing, host: selected.host, name: selected.name })
    process.stdout.write(
      chalk.green(`✔ TV set to ${selected.name} (${selected.host})\n`),
    )
  }

  return found
}

export { discover, type DiscoveredDevice }
