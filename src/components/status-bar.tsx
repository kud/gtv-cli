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

type Props = { state: RemoteState; lastKey: string }

const StatusBar = ({ state, lastKey }: Props) => {
  const appName = state.currentApp
    ? (APP_NAMES[state.currentApp] ?? state.currentApp.split(".").pop() ?? "–")
    : "–"

  const volDisplay = state.volume
    ? state.volume.muted
      ? "muted"
      : `${state.volume.level}/${state.volume.maximum}`
    : "–"

  return (
    <Box justifyContent="space-between" marginBottom={1} gap={2}>
      <Text bold color="cyan">
        GTV
      </Text>
      <Text color={state.connected ? "green" : "yellow"}>
        {state.connected ? "● connected" : "○ connecting…"}
      </Text>
      <Text>
        {"app: "}
        <Text color="yellow">{appName}</Text>
      </Text>
      <Text>
        {"vol: "}
        <Text color={state.volume?.muted ? "red" : "white"}>{volDisplay}</Text>
      </Text>
      {lastKey && (
        <Text color="gray">
          {"↩ "}
          {lastKey}
        </Text>
      )}
      {state.error && <Text color="red">{state.error}</Text>}
    </Box>
  )
}

export { StatusBar }
