import { useEffect, useRef, useState } from "react"
import { AndroidRemote, RemoteDirection } from "androidtv-remote"
import { readConfig } from "../lib/config.js"
import { silenceRemoteConsole, stopRemote } from "../lib/remote.js"
import { KEYCODE_DEL, sendText } from "../lib/text-input.js"

type VolumeState = { level: number; maximum: number; muted: boolean }

type RemoteState = {
  tvName: string | null
  host: string | null
  connected: boolean
  powered: boolean | null
  volume: VolumeState | null
  currentApp: string | null
  error: string | null
}

const useRemote = () => {
  const [state, setState] = useState<RemoteState>({
    tvName: null,
    host: null,
    connected: false,
    powered: null,
    volume: null,
    currentApp: null,
    error: null,
  })

  const remoteRef = useRef<AndroidRemote | null>(null)

  useEffect(() => {
    const config = readConfig()
    const restoreConsole = silenceRemoteConsole()

    if (!config) {
      restoreConsole()
      setState((s) => ({
        ...s,
        error: "No TV configured. Run `gtv pair` first.",
      }))
      return
    }

    setState((s) => ({
      ...s,
      tvName: config.name ?? "Google TV",
      host: config.host,
    }))

    const remote = new AndroidRemote(config.host, {
      pairing_port: 6467,
      remote_port: config.port ?? 6466,
      service_name: config.name ?? "gtv-cli",
      ...(config.cert ? { cert: config.cert } : {}),
    })

    remoteRef.current = remote

    remote.on("ready", () =>
      setState((s) => ({ ...s, connected: true, error: null })),
    )
    remote.on("powered", (powered: boolean) =>
      setState((s) => ({ ...s, powered })),
    )
    remote.on("volume", (volume: VolumeState) =>
      setState((s) => ({ ...s, volume })),
    )
    remote.on("current_app", (app: string) =>
      setState((s) => ({ ...s, currentApp: app })),
    )
    remote.on("error", (err: Error) =>
      setState((s) => ({ ...s, connected: false, error: err.message })),
    )
    remote.on("unpaired", () =>
      setState((s) => ({
        ...s,
        connected: false,
        error: "TV rejected the saved pairing. Run `gtv pair` again.",
      })),
    )

    remote
      .start()
      .catch((err: Error) => setState((s) => ({ ...s, error: err.message })))

    return () => {
      stopRemote(remote)
      restoreConsole()
    }
  }, [])

  const sendKey = (keyCode: number, direction = RemoteDirection.SHORT) => {
    remoteRef.current?.sendKey(keyCode, direction)
  }

  const typeText = (text: string) => {
    if (remoteRef.current) sendText(remoteRef.current, text)
  }

  const deleteTextCharacter = () => {
    remoteRef.current?.sendKey(KEYCODE_DEL, RemoteDirection.SHORT)
  }

  return { state, sendKey, typeText, deleteTextCharacter }
}

export { useRemote, type RemoteState }
