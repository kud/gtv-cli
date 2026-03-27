import fs from "node:fs"
import path from "node:path"

const CONFIG_PATH = path.join(
  process.env["HOME"] ?? "~",
  ".config",
  "gtv",
  "config.json",
)

type Cert = { key: string; cert: string }

type Config = {
  host: string
  port?: number
  name?: string
  cert?: Cert
}

const readConfig = (): Config | null => {
  if (!fs.existsSync(CONFIG_PATH)) return null
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")) as Config
}

const writeConfig = (config: Config): void => {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n")
}

export { readConfig, writeConfig, type Config, type Cert }
