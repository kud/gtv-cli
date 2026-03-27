import { AndroidRemote, RemoteDirection, RemoteKeyCode } from "androidtv-remote"
import { readConfig } from "./config.js"

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
    remote.on("ready", () => resolve(remote))
    remote.on("error", reject)
    remote.start().catch(reject)
  })
}

const withRemote = async (
  fn: (remote: AndroidRemote) => void,
): Promise<void> => {
  const remote = await connect()
  fn(remote)
  await new Promise((r) => setTimeout(r, 300))
  remote.stop()
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
