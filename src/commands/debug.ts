import chalk from "chalk"
import { createSession, setDebug, type SessionState } from "@kud/gtv"

// Streams the library's live protocol logs plus session-state changes until
// Ctrl+C. The native replacement for the old monkey-patched `ime-debug`:
// open a text field on the TV to watch IME messages, app focus, volume, etc.
const debug = async (): Promise<void> => {
  setDebug(true)

  process.stdout.write(
    chalk.bold("Google TV debug — streaming protocol logs\n") +
      chalk.gray(
        "Connecting… open a text field on the TV to see IME messages. Ctrl+C to stop.\n\n",
      ),
  )

  const session = createSession()

  session.on("change", (state: SessionState) => {
    process.stdout.write(
      chalk.cyan("[state] ") +
        JSON.stringify({
          connected: state.connected,
          powered: state.powered,
          volume: state.volume,
          currentApp: state.currentApp,
          error: state.error,
        }) +
        "\n",
    )
  })
  session.on("error", (error: Error) =>
    process.stdout.write(chalk.red(`[error] ${error.message}\n`)),
  )

  process.on("SIGINT", () => {
    session.stop()
    process.exit(0)
  })

  await new Promise<void>(() => {})
}

export { debug }
