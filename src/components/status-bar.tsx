import React from "react"
import { Box, Text } from "ink"
import type { RemoteState } from "../hooks/use-remote.js"

const APP_NAMES: Record<string, string> = {
  "com.netflix.ninja": "Netflix",
  "com.google.android.youtube.tv": "YouTube",
  "com.spotify.tv.android": "Spotify",
  "com.apple.atve.androidtv.appletv": "Apple TV+",
  "com.disney.disneyplus": "Disney+",
  "tv.twitch.android.app": "Twitch",
  "com.amazon.amazonvideo.livingroom": "Prime Video",
  "com.google.android.tvlauncher": "Home",
  "com.google.android.leanbacklauncher": "Home",
  "com.plexapp.android": "Plex",
  "com.mubi": "MUBI",
}

type Props = {
  state: RemoteState
  lastKey: string
  mode: "remote" | "keyboard"
}

const StatusBar = ({ state, lastKey, mode }: Props) => {
  const appName = state.currentApp
    ? (APP_NAMES[state.currentApp] ?? state.currentApp.split(".").pop() ?? "–")
    : "–"

  const volDisplay = state.volume
    ? state.volume.muted
      ? "muted"
      : `${state.volume.level}/${state.volume.maximum}`
    : "–"

  const powerDisplay =
    state.powered === null ? "unknown" : state.powered ? "on" : "off"

  return (
    <Box flexDirection="column" marginBottom={1} rowGap={1}>
      <Box justifyContent="space-between" columnGap={2}>
        <Box columnGap={1}>
          <Text bold color="cyan">
            {state.tvName ?? "Google TV"}
          </Text>
          <Text color="gray">·</Text>
          <Text color={state.connected ? "green" : "yellow"}>
            {state.connected ? "connected" : "connecting"}
          </Text>
          <Text color="gray">·</Text>
          <Text bold color={mode === "keyboard" ? "cyan" : "gray"}>
            {mode === "keyboard" ? "⌨ KEYBOARD" : "REMOTE"}
          </Text>
        </Box>

        <Box columnGap={2}>
          <Text>
            <Text color="gray">host </Text>
            <Text>{state.host ?? "–"}</Text>
          </Text>
          <Text>
            <Text color="gray">power </Text>
            <Text color={state.powered === false ? "yellow" : "white"}>
              {powerDisplay}
            </Text>
          </Text>
        </Box>
      </Box>

      <Box justifyContent="space-between" columnGap={2}>
        <Box columnGap={2}>
          <Text>
            <Text color="gray">app </Text>
            <Text color="yellow">{appName}</Text>
          </Text>
          <Text>
            <Text color="gray">vol </Text>
            <Text color={state.volume?.muted ? "red" : "white"}>
              {volDisplay}
            </Text>
          </Text>
        </Box>

        <Box>
          {lastKey && (
            <Text>
              <Text color="gray">last </Text>
              <Text>{lastKey}</Text>
            </Text>
          )}
          {state.error && <Text color="red">{state.error}</Text>}
        </Box>
      </Box>
    </Box>
  )
}

export { StatusBar }
