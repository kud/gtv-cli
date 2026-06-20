import type { AndroidRemote } from "androidtv-remote"

type ConsoleMethod = "debug" | "error" | "info" | "log"

const METHODS_TO_SILENCE: ConsoleMethod[] = ["debug", "error", "info", "log"]
const originalConsole = new Map<ConsoleMethod, typeof console.debug>()
let silenceDepth = 0

type RemoteWithInternals = AndroidRemote & {
  pairingManager?: {
    client?: { removeAllListeners: (event?: string) => void; destroy: () => void }
  }
  remoteManager?: {
    client?: { removeAllListeners: (event?: string) => void; destroy: () => void }
  }
}

const stopRemote = (remote: AndroidRemote): void => {
  const typedRemote = remote as RemoteWithInternals
  const clients = [
    typedRemote.pairingManager?.client,
    typedRemote.remoteManager?.client,
  ].filter((client): client is NonNullable<typeof client> => Boolean(client))

  try {
    for (const client of clients) {
      client.removeAllListeners("close")
      client.destroy()
    }
  } catch {
    try {
      remote.stop()
    } catch {}
  }
}

const silenceRemoteConsole = (): (() => void) => {
  if (silenceDepth === 0) {
    for (const method of METHODS_TO_SILENCE) {
      originalConsole.set(method, console[method])
      console[method] = () => {}
    }
  }

  silenceDepth += 1

  return () => {
    silenceDepth = Math.max(0, silenceDepth - 1)
    if (silenceDepth > 0) return

    for (const method of METHODS_TO_SILENCE) {
      const original = originalConsole.get(method)
      if (original) console[method] = original
    }
    originalConsole.clear()
  }
}

export { stopRemote, silenceRemoteConsole }
