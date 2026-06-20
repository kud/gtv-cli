import React from "react"
import { Box, Text } from "ink"
import type { IconStyle } from "../lib/config.js"

type Option = { value: IconStyle; label: string; hint: string }

const ICON_STYLE_OPTIONS: Option[] = [
  {
    value: "text",
    label: "Text only",
    hint: "labels, no icons (most portable)",
  },
  {
    value: "nerd",
    label: "Nerd Font",
    hint: "single-width glyphs (needs a Nerd Font)",
  },
  { value: "emoji", label: "Emoji", hint: "universal, may shift alignment" },
]

const SettingsPanel = ({
  width,
  cursor,
  current,
}: {
  width: number
  cursor: number
  current: IconStyle
}) => (
  <Box
    borderStyle="round"
    borderColor="yellow"
    flexDirection="column"
    width={width}
    paddingX={2}
    paddingY={1}
  >
    <Text bold>Preferences</Text>
    <Text color="gray">Icon style</Text>

    <Box flexDirection="column" marginTop={1}>
      {ICON_STYLE_OPTIONS.map((option, index) => {
        const active = index === cursor
        const saved = option.value === current
        return (
          <Box key={option.value} columnGap={1}>
            <Text color={active ? "yellow" : "gray"}>{active ? "❯" : " "}</Text>
            <Text color={saved ? "green" : undefined}>{saved ? "●" : "○"}</Text>
            <Text bold={active} color={active ? "yellow" : undefined}>
              {option.label}
            </Text>
            <Text color="gray">{option.hint}</Text>
          </Box>
        )
      })}
    </Box>

    <Box marginTop={1} justifyContent="space-between">
      <Text color="gray">↑↓ move · Enter save</Text>
      <Text color="gray">Esc close</Text>
    </Box>
  </Box>
)

export { SettingsPanel, ICON_STYLE_OPTIONS }
