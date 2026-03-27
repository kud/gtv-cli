import React, { useState } from "react"
import { Box, useInput } from "ink"
import { useRemote } from "./hooks/use-remote.js"
import { StatusBar } from "./components/status-bar.js"
import { RemoteLayout } from "./components/remote-layout.js"
import { KEYS } from "./lib/keycodes.js"

const CHAR_MAP: Record<string, string> = {
  " ": "play",
  h: "home",
  p: "power",
  m: "mute",
  e: "menu",
  s: "search",
  ".": "stop",
  ",": "prev",
  "/": "next",
  "[": "rwd",
  "]": "fwd",
  "=": "vol-up",
  "-": "vol-down",
}

const App = () => {
  const [lastKey, setLastKey] = useState("")
  const { state, sendKey } = useRemote()

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) process.exit(0)

    const keyName = key.upArrow
      ? "up"
      : key.downArrow
        ? "down"
        : key.leftArrow
          ? "left"
          : key.rightArrow
            ? "right"
            : key.return
              ? "select"
              : key.escape || key.backspace
                ? "back"
                : (CHAR_MAP[input] ?? null)

    if (!keyName) return

    const keyCode = KEYS[keyName]
    if (!keyCode) return

    setLastKey(keyName)
    sendKey(keyCode)
  })

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="blue"
      paddingX={2}
      paddingY={1}
    >
      <StatusBar state={state} lastKey={lastKey} />
      <RemoteLayout />
    </Box>
  )
}

export { App }
