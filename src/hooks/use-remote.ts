import { useEffect, useRef, useState } from "react"
import { AndroidRemote, RemoteDirection, RemoteKeyCode } from "androidtv-remote"
import { readConfig } from "../lib/config.js"

type VolumeState = { level: number; maximum: number; muted: boolean }

type RemoteState = {
  connected: boolean
  powered: boolean | null
  volume: VolumeState | null
  currentApp: string | null
  error: string | null
}

const useRemote = () => {
  const [state, setState] = useState<RemoteState>({
    connected: false,
    powered: null,
    volume: null,
    currentApp: null,
    error: null,
  })

  const remoteRef = useRef<AndroidRemote | null>(null)

  useEffect(() => {
    const config = readConfig()

    if (!config) {
      setState((s) => ({
        ...s,
        error: "No TV configured. Run `gtv pair` first.",
      }))
      return
    }

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

    remote
      .start()
      .catch((err: Error) => setState((s) => ({ ...s, error: err.message })))

    return () => {
      remote.stop()
    }
  }, [])

  const sendKey = (keyCode: number, direction = RemoteDirection.SHORT) => {
    remoteRef.current?.sendKey(keyCode, direction)
  }

  return { state, sendKey }
}

export { useRemote, type RemoteState }
