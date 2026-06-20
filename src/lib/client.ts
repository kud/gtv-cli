import { AndroidRemote, RemoteDirection } from "androidtv-remote"
import { readConfig } from "./config.js"
import { silenceRemoteConsole, stopRemote } from "./remote.js"

const CONNECT_TIMEOUT_MS = 8000

const connect = (): Promise<AndroidRemote> => {
  const config = readConfig()
  if (!config) throw new Error("No TV configured. Run `gtv pair` first.")

  const remote = new AndroidRemote(config.host, {
    pairing_port: 6467,
    remote_port: config.port ?? 6466,
    service_name: config.name ?? "gtv-cli",
    ...(config.cert ? { cert: config.cert } : {}),
  })

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      stopRemote(remote)
      reject(
        new Error(
          `Timed out connecting to ${config.host}. Run \`gtv pair\` again if the TV is online.`,
        ),
      )
    }, CONNECT_TIMEOUT_MS)

    const fail = (error: Error) => {
      clearTimeout(timeout)
      stopRemote(remote)
      reject(error)
    }

    remote.once("ready", () => {
      clearTimeout(timeout)
      resolve(remote)
    })
    remote.once("unpaired", () =>
      fail(new Error("TV rejected the saved pairing. Run `gtv pair` again.")),
    )
    remote.once("error", fail)
    remote
      .start()
      .then((started) => {
        if (!started)
          fail(
            new Error(
              `Could not connect to ${config.host}. Check that remote control is enabled on the TV.`,
            ),
          )
      })
      .catch(fail)
  })
}

const withRemote = async (
  fn: (remote: AndroidRemote) => void,
): Promise<void> => {
  const restoreConsole = silenceRemoteConsole()
  const remote = await connect()
  try {
    fn(remote)
    await new Promise((r) => setTimeout(r, 300))
  } finally {
    stopRemote(remote)
    restoreConsole()
  }
}

const sendKey = (keyCode: number): Promise<void> =>
  withRemote((remote) => {
    remote.sendKey(keyCode, RemoteDirection.SHORT)
  })

const launchApp = (deeplink: string): Promise<void> =>
  withRemote((remote) => {
    remote.sendAppLink(deeplink)
  })

export { connect, sendKey, launchApp }
