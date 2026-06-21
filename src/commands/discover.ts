import ora from "ora"
import chalk from "chalk"
import inquirer from "inquirer"
import {
  discover as discoverDevices,
  upsertDevice,
  getCurrentDevice,
  type DiscoveredDevice,
} from "@kud/gtv"

// CLI driver around @kud/gtv's pure discover(): adds the spinner, the optional
// device picker, persistence, and coloured output.
const discover = async (
  opts: { timeout?: number; select?: boolean; quiet?: boolean } = {},
): Promise<DiscoveredDevice[]> => {
  const spinner = opts.quiet
    ? null
    : ora("Scanning for Google TV devices…").start()

  const found = await discoverDevices({ timeout: opts.timeout })

  if (found.length === 0) {
    spinner?.fail("No Google TV devices found on the network.")
    return []
  }

  if (spinner) {
    spinner.succeed(`Found ${found.length} device(s):`)
    found.forEach((d) => {
      process.stdout.write(
        `  ${chalk.cyan(d.name)}  ${chalk.gray(`${d.host}:${d.port}`)}\n`,
      )
    })
  }

  if (opts.select) {
    const existing = getCurrentDevice()
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

    upsertDevice({
      host: selected.host,
      port: selected.port,
      name: selected.name,
    })
    process.stdout.write(
      chalk.green(`✔ Active TV set to ${selected.name} (${selected.host})\n`),
    )
  }

  return found
}

export { discover, type DiscoveredDevice }
