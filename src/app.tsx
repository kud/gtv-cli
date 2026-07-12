import React, { useState } from "react"
import { Box, Text, useApp, useInput, useStdout } from "ink"
import { useRemote } from "./hooks/use-remote.js"
import { StatusBar } from "./components/status-bar.js"
import { RemoteLayout } from "./components/remote-layout.js"
import { Preferences } from "./components/preferences.js"
import { AppLauncher } from "./components/app-launcher.js"
import { Hotkeys } from "./components/hotkeys.js"
import { KEYS, appLink, RemoteDirection, type AppEntry } from "@kud/gtv"
import { readIconStyle, enabledApps, orderedApps } from "./lib/preferences.js"
import { fuzzyFilter } from "./lib/fuzzy.js"

// A terminal emits no key-up event, so a long press is synthesised: bracket the
// keycode with START_LONG then END_LONG after holding for this long.
const LONG_PRESS_MS = 500

// Keys that respond to a long press on a real remote (d-pad + OK).
const LONG_PRESSABLE = new Set(["up", "down", "left", "right", "select"])

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
  const [iconStyle, setIconStyle] = useState(() => readIconStyle())
  const [settingsMode, setSettingsMode] = useState(false)
  const [enabledIds, setEnabledIds] = useState<string[]>(() =>
    enabledApps().map((app) => app.id),
  )
  const [apps, setApps] = useState<AppEntry[]>(() => orderedApps())
  const [appsMode, setAppsMode] = useState(false)
  const [appsCursor, setAppsCursor] = useState(0)
  const [appsFilter, setAppsFilter] = useState("")
  const [appsFiltering, setAppsFiltering] = useState(false)
  const { exit } = useApp()
  const { stdout } = useStdout()
  const { state, sendKey, typeText, launchApp } = useRemote()

  const longPress = (keyCode: number) => {
    sendKey(keyCode, RemoteDirection.START_LONG)
    setTimeout(() => sendKey(keyCode, RemoteDirection.END_LONG), LONG_PRESS_MS)
  }

  // Only enabled apps appear in the launcher; the Preferences "Apps" tab toggles
  // them against the full catalog.
  const launcherApps = apps.filter((app) => enabledIds.includes(app.id))
  // The launcher's "/" filter narrows the visible list; the cursor indexes into
  // these results, so every handler below reads appResults, not launcherApps.
  const appResults = fuzzyFilter(appsFilter, launcherApps, (app) => app.name)

  const closeApps = () => {
    setAppsMode(false)
    setAppsFiltering(false)
    setAppsFilter("")
  }

  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      exit()
      return
    }

    // The Preferences panel owns all input while it is open.
    if (settingsMode) return

    if (appsMode) {
      if (launcherApps.length === 0) {
        closeApps()
        return
      }

      if (key.escape) {
        // A first Esc backs out of the filter; a second closes the launcher.
        if (appsFiltering) {
          setAppsFiltering(false)
          setAppsFilter("")
          setAppsCursor(0)
        } else {
          closeApps()
        }
        return
      }

      if (key.return) {
        const app = appResults[appsCursor]
        if (app) {
          launchApp(appLink(app))
          setLastKey(`launch: ${app.name}`)
          closeApps()
        }
        return
      }

      if (key.upArrow) {
        if (appResults.length > 0) {
          setAppsCursor((c) => (c - 1 + appResults.length) % appResults.length)
        }
        return
      }
      if (key.downArrow) {
        if (appResults.length > 0) {
          setAppsCursor((c) => (c + 1) % appResults.length)
        }
        return
      }

      // "/" opens the filter; once open, printable keys edit the query and the
      // list narrows live. Reset the cursor so it never points past the results.
      if (!appsFiltering) {
        if (input === "/") setAppsFiltering(true)
        return
      }
      if (key.backspace || key.delete) {
        setAppsFilter((q) => q.slice(0, -1))
        setAppsCursor(0)
        return
      }
      if (input && !key.tab) {
        setAppsFilter((q) => q + input)
        setAppsCursor(0)
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
      setSettingsMode(true)
      setLastKey("preferences")
      return
    }

    if (input === "a") {
      setAppsCursor(0)
      setAppsMode(true)
      setLastKey("apps")
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

    if (key.shift && LONG_PRESSABLE.has(keyName)) {
      longPress(keyCode)
      setLastKey(`${keyName} (long)`)
      return
    }

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
      borderDimColor
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
          <Preferences
            width={contentWidth}
            iconStyle={iconStyle}
            setIconStyle={setIconStyle}
            enabledIds={enabledIds}
            setEnabledIds={setEnabledIds}
            apps={apps}
            setApps={setApps}
            onExit={() => setSettingsMode(false)}
            onStatus={setLastKey}
          />
        ) : appsMode ? (
          <AppLauncher
            width={contentWidth}
            cursor={appsCursor}
            apps={appResults}
            filtering={appsFiltering}
            query={appsFilter}
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
            <Box marginTop={1}>
              <Hotkeys
                hints={[
                  { key: "↵", label: "send / submit" },
                  { key: "⌫", label: "edit" },
                  { key: "⇥", label: "remote" },
                  { key: "esc", label: "exit" },
                ]}
              />
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
