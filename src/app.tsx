import React, { useState } from "react"
import { Box, Text, useApp, useInput, useStdout } from "ink"
import { useRemote } from "./hooks/use-remote.js"
import { StatusBar } from "./components/status-bar.js"
import { RemoteLayout } from "./components/remote-layout.js"
import {
  SettingsPanel,
  ICON_STYLE_OPTIONS,
} from "./components/settings-panel.js"
import { KEYS } from "./lib/keycodes.js"
import { readPreferences, writePreferences } from "./lib/config.js"

const CHAR_MAP: Record<string, string> = {
  " ": "play",
  h: "home",
  p: "power",
  m: "mute",
  e: "settings",
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
  const [mode, setMode] = useState<"remote" | "keyboard">("remote")
  const [typed, setTyped] = useState("")
  const [iconStyle, setIconStyle] = useState(() => readPreferences().iconStyle)
  const [settingsMode, setSettingsMode] = useState(false)
  const [settingsCursor, setSettingsCursor] = useState(0)
  const { exit } = useApp()
  const { stdout } = useStdout()
  const { state, sendKey, typeText } = useRemote()

  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      exit()
      return
    }

    if (settingsMode) {
      if (key.escape) {
        setSettingsMode(false)
        return
      }
      if (key.upArrow) {
        setSettingsCursor(
          (c) =>
            (c - 1 + ICON_STYLE_OPTIONS.length) % ICON_STYLE_OPTIONS.length,
        )
        return
      }
      if (key.downArrow) {
        setSettingsCursor((c) => (c + 1) % ICON_STYLE_OPTIONS.length)
        return
      }
      if (key.return) {
        const chosen = ICON_STYLE_OPTIONS[settingsCursor]!.value
        writePreferences({ iconStyle: chosen })
        setIconStyle(chosen)
        setLastKey(`icons: ${chosen}`)
        setSettingsMode(false)
        return
      }
      return
    }

    if (key.tab) {
      setMode((m) => (m === "remote" ? "keyboard" : "remote"))
      setTyped("")
      setLastKey("mode switch")
      return
    }

    if (mode === "keyboard") {
      if (key.escape) {
        // BACK dismisses the TV's on-screen keyboard so the d-pad controls the
        // app again instead of being swallowed by the keyboard overlay.
        const backCode = KEYS["back"]
        if (backCode) sendKey(backCode)
        setMode("remote")
        setTyped("")
        return
      }

      if (key.return) {
        if (typed) {
          typeText(typed)
          setLastKey(`sent "${typed}"`)
          setTyped("")
        } else {
          const enterCode = KEYS["enter"]
          if (enterCode) sendKey(enterCode)
          setLastKey("submit")
        }
        return
      }

      if (key.backspace || key.delete) {
        setTyped((value) => value.slice(0, -1))
        return
      }

      const navName = key.upArrow
        ? "up"
        : key.downArrow
          ? "down"
          : key.leftArrow
            ? "left"
            : key.rightArrow
              ? "right"
              : null

      if (navName) {
        const navCode = KEYS[navName]
        if (navCode) {
          sendKey(navCode)
          setLastKey(navName)
        }
        return
      }

      if (input) {
        setTyped((value) => value + input)
      }
      return
    }

    if (input === "q") {
      exit()
      return
    }

    if (input === "o") {
      setSettingsCursor(
        Math.max(
          0,
          ICON_STYLE_OPTIONS.findIndex((option) => option.value === iconStyle),
        ),
      )
      setSettingsMode(true)
      setLastKey("preferences")
      return
    }

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

  const columns = stdout.columns ?? 80
  const contentWidth = Math.max(28, Math.min(64, columns - 6))
  const tooNarrow = columns < 34

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="gray"
      width={columns}
      height={stdout.rows}
      paddingX={2}
      paddingY={1}
    >
      <StatusBar state={state} lastKey={lastKey} mode={mode} />
      <Box flexGrow={1} alignItems="center" justifyContent="center">
        {tooNarrow ? (
          <Text color="yellow">Resize terminal to at least 34 columns.</Text>
        ) : settingsMode ? (
          <SettingsPanel
            width={contentWidth}
            cursor={settingsCursor}
            current={iconStyle}
          />
        ) : mode === "keyboard" ? (
          <Box
            borderStyle="round"
            borderColor="cyan"
            flexDirection="column"
            width={contentWidth}
            paddingX={2}
            paddingY={1}
          >
            <Box justifyContent="space-between">
              <Text bold color="cyan">
                ⌨ KEYBOARD
              </Text>
              <Text color="gray">→ {state.tvName ?? "TV"}</Text>
            </Box>
            <Box
              marginTop={1}
              borderStyle="single"
              paddingX={1}
              minHeight={5}
              alignItems="flex-start"
            >
              <Text>
                {typed}
                <Text color="cyan">▌</Text>
              </Text>
            </Box>
            <Box marginTop={1} flexDirection="column">
              <Text color="gray">
                Enter sends the text · Enter again (empty) submits
              </Text>
              <Text color="gray">
                ⌫ edit · Tab toggle · Esc exit + dismiss keyboard
              </Text>
            </Box>
          </Box>
        ) : (
          <RemoteLayout width={contentWidth} iconStyle={iconStyle} />
        )}
      </Box>
    </Box>
  )
}

export { App }
