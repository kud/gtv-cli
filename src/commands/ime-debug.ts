import chalk from "chalk"
import { remoteMessageManager } from "androidtv-remote/dist/remote/RemoteMessageManager.js"
import { connect } from "../lib/client.js"
import { silenceRemoteConsole, stopRemote } from "../lib/remote.js"

// Ping traffic is constant heartbeat noise; everything else is worth seeing.
const NOISE = new Set(["remotePingRequest", "remotePingResponse"])

// Wrap the library's message parser so we can observe every message the TV
// sends — IME field state, app focus, anything — without racing its own parsing.
const imeDebug = async (): Promise<void> => {
  const original = remoteMessageManager.parse.bind(remoteMessageManager)

  remoteMessageManager.parse = (buffer) => {
    const message = original(buffer)
    try {
      const json =
        typeof message.toJSON === "function" ? message.toJSON() : message
      const keys = Object.keys(json).filter(
        (key) => json[key] != null && !NOISE.has(key),
      )
      if (keys.length > 0) {
        const picked = Object.fromEntries(keys.map((key) => [key, json[key]]))
        process.stdout.write(
          `${chalk.cyan("\n[MSG]")} ${JSON.stringify(picked)}\n`,
        )
      }
    } catch {
      // Observation must never break the real parse path.
    }
    return message
  }

  const restoreConsole = silenceRemoteConsole()

  process.stdout.write(
    chalk.bold("Google TV IME capture\n\n") +
      "1. Wait for 'Connected'.\n" +
      "2. On the TV, open a text field (e.g. YouTube search).\n" +
      "3. Type a letter with the on-screen keyboard (d-pad + OK).\n" +
      "4. Copy everything printed below and send it back.\n\n" +
      chalk.gray("Press Ctrl+C to stop.\n"),
  )

  const remote = await connect()
  process.stdout.write(chalk.green("\nConnected. Watching IME messages…\n"))

  const cleanup = () => {
    remoteMessageManager.parse = original
    stopRemote(remote)
    restoreConsole()
    process.exit(0)
  }
  process.on("SIGINT", cleanup)

  await new Promise<void>(() => {})
}

export { imeDebug }
