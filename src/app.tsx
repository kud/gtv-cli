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
  const [iconStyle, setIconStyle] = useState(() => readPreferences().iconStyle)
  const [settingsMode, setSettingsMode] = useState(false)
  const [settingsCursor, setSettingsCursor] = useState(0)
  const { exit } = useApp()
  const { stdout } = useStdout()
  const { state, sendKey, typeText, deleteTextCharacter } = useRemote()

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
      setLastKey("mode switch")
      return
    }

    if (mode === "keyboard") {
      if (key.escape) {
        setMode("remote")
        return
      }

      if (key.return) {
        typeText("\n")
        setLastKey("submit")
        return
      }

      if (key.backspace || key.delete) {
        deleteTextCharacter()
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
        typeText(input)
        setLastKey("typed")
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
          <Box flexDirection="column" alignItems="center">
            <Text bold color="cyan">
              ⌨ KEYBOARD MODE
            </Text>
            <Box marginTop={1}>
              <Text>
                Type here to send keystrokes straight to{" "}
                <Text bold color="cyan">
                  {state.tvName ?? "the TV"}
                </Text>
                .
              </Text>
            </Box>
            <Box>
              <Text color="gray">
                Use the TV's on-screen keyboard to see them.
              </Text>
            </Box>
            <Box marginTop={1}>
              <Text color="gray">Enter submit · ⌫ delete · Tab/Esc remote</Text>
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
