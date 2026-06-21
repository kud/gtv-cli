import React from "react"
import { Box, Text } from "ink"
import type { AppEntry } from "@kud/gtv"
import type { IconStyle } from "../lib/preferences.js"
import { Hotkeys } from "./hotkeys.js"

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

const PREF_CATEGORIES = ["general", "apps"] as const
type PrefCategory = (typeof PREF_CATEGORIES)[number]

const Tabs = ({ category }: { category: PrefCategory }) => (
  <Box columnGap={1}>
    {PREF_CATEGORIES.map((c) => {
      const active = c === category
      const label = c === "general" ? "General" : "Apps"
      return (
        <Text
          key={c}
          bold={active}
          color={active ? "black" : "gray"}
          backgroundColor={active ? "yellow" : undefined}
        >
          {` ${label} `}
        </Text>
      )
    })}
  </Box>
)

const SettingsPanel = ({
  width,
  category,
  cursor,
  iconStyle,
  apps,
  enabledIds,
}: {
  width: number
  category: PrefCategory
  cursor: number
  iconStyle: IconStyle
  apps: AppEntry[]
  enabledIds: string[]
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
    <Box marginTop={1}>
      <Tabs category={category} />
    </Box>

    {category === "general" ? (
      <Box flexDirection="column" marginTop={1}>
        {ICON_STYLE_OPTIONS.map((option, index) => {
          const active = index === cursor
          const saved = option.value === iconStyle
          return (
            <Box key={option.value} columnGap={1}>
              <Text color={active ? "yellow" : "gray"}>
                {active ? "❯" : " "}
              </Text>
              <Text color={saved ? "green" : undefined}>
                {saved ? "●" : "○"}
              </Text>
              <Text bold={active} color={active ? "yellow" : undefined}>
                {option.label}
              </Text>
              <Text color="gray">{option.hint}</Text>
            </Box>
          )
        })}
      </Box>
    ) : (
      <Box flexDirection="column" marginTop={1}>
        {apps.map((app, index) => {
          const active = index === cursor
          const on = enabledIds.includes(app.id)
          return (
            <Box key={app.id} columnGap={1}>
              <Text color={active ? "yellow" : "gray"}>
                {active ? "❯" : " "}
              </Text>
              <Text color={on ? "green" : "gray"}>{on ? "◉" : "○"}</Text>
              <Text bold={active} color={active ? "yellow" : undefined}>
                {app.name}
              </Text>
            </Box>
          )
        })}
      </Box>
    )}

    <Box marginTop={1}>
      <Hotkeys
        hints={[
          { key: "↑↓", label: "move" },
          category === "general"
            ? { key: "↵", label: "save" }
            : { key: "spc", label: "toggle" },
          { key: "⇥", label: "category" },
          { key: "esc", label: "close" },
        ]}
      />
    </Box>
  </Box>
)

export { SettingsPanel, ICON_STYLE_OPTIONS, PREF_CATEGORIES }
export type { PrefCategory }
