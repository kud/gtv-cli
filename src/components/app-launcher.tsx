import React from "react"
import { Box, Text } from "ink"
import type { AppEntry } from "@kud/gtv"
import { Hotkeys } from "./hotkeys.js"

const AppLauncher = ({
  width,
  cursor,
  apps,
}: {
  width: number
  cursor: number
  apps: AppEntry[]
}) => (
  <Box
    borderStyle="round"
    borderColor="magenta"
    flexDirection="column"
    width={width}
    paddingX={2}
    paddingY={1}
  >
    <Text bold>Launch app</Text>

    <Box flexDirection="column" marginTop={1}>
      {apps.map((app, index) => {
        const active = index === cursor
        return (
          <Box key={app.id} columnGap={1}>
            <Text color={active ? "magenta" : "gray"}>
              {active ? "❯" : " "}
            </Text>
            <Text bold={active} color={active ? "magenta" : undefined}>
              {app.name}
            </Text>
          </Box>
        )
      })}
    </Box>

    <Box marginTop={1}>
      <Hotkeys
        hints={[
          { key: "↑↓", label: "move" },
          { key: "↵", label: "launch" },
          { key: "esc", label: "close" },
        ]}
      />
    </Box>
  </Box>
)

export { AppLauncher }
