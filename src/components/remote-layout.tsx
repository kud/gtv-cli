import React from "react"
import { Box, Text } from "ink"
import { iconFor } from "../lib/icons.js"
import type { IconStyle } from "../lib/config.js"

const DEFAULT_WIDTH = 64
const TWO_COLUMN_MIN = 96

const Btn = ({
  icon,
  label,
  hint,
  width,
}: {
  icon: string
  label: string
  hint: string
  width: number
}) => (
  <Box
    borderStyle="single"
    borderColor="gray"
    width={width}
    height={3}
    paddingX={1}
    alignItems="center"
    justifyContent="center"
  >
    <Text wrap="truncate">
      {icon ? <Text color="cyan">{`${icon} `}</Text> : null}
      <Text bold color="yellow">
        {label}
      </Text>
      <Text bold color="white">
        {` ${hint}`}
      </Text>
    </Text>
  </Box>
)

const Row = ({ children }: { children: React.ReactNode }) => (
  <Box columnGap={1} justifyContent="center" flexWrap="wrap">
    {children}
  </Box>
)

const Divider = ({ title, width }: { title: string; width: number }) => {
  const inner = ` ${title} `
  const dashes = Math.max(2, width - inner.length)
  const left = "─".repeat(Math.floor(dashes / 2))
  const right = "─".repeat(dashes - left.length)
  return (
    <Box width={width}>
      <Text color="gray">
        {left}
        {inner}
        {right}
      </Text>
    </Box>
  )
}

const Section = ({
  title,
  width,
  children,
}: {
  title: string
  width: number
  children: React.ReactNode
}) => (
  <Box flexDirection="column" alignItems="center" marginTop={1} width={width}>
    <Divider title={title} width={width} />
    {children}
  </Box>
)

const RemoteLayout = ({
  width = DEFAULT_WIDTH,
  iconStyle = "text",
}: {
  width?: number
  iconStyle?: IconStyle
}) => {
  const twoColumn = width >= TWO_COLUMN_MIN
  const colWidth = twoColumn ? Math.floor((width - 4) / 2) : width
  // Size buttons to fit the longest label+hotkey ("SEARCH s", "PLAY spc") so the
  // hotkey never truncates; rows wrap when a column is too narrow for all of them.
  const minButton = iconStyle === "text" ? 12 : 15
  const maxButton = iconStyle === "text" ? 13 : 16
  const btnWidth = Math.max(
    minButton,
    Math.min(maxButton, Math.floor((colWidth - 3) / 4)),
  )
  const btn = (action: string, label: string, hint: string) => (
    <Btn
      icon={iconFor(action, iconStyle)}
      label={label}
      hint={hint}
      width={btnWidth}
    />
  )

  const system = (
    <Section title="System" width={colWidth}>
      <Row>
        {btn("power", "PWR", "p")}
        {btn("home", "HOME", "h")}
        {btn("back", "BACK", "esc")}
        {btn("settings", "SET", "e")}
        {btn("search", "SEARCH", "s")}
      </Row>
    </Section>
  )

  const navigation = (
    <Section title="Navigation" width={colWidth}>
      {btn("up", "UP", "↑")}
      <Row>
        {btn("left", "LEFT", "←")}
        {btn("select", "OK", "↵")}
        {btn("right", "RIGHT", "→")}
      </Row>
      {btn("down", "DOWN", "↓")}
    </Section>
  )

  const playback = (
    <Section title="Playback" width={colWidth}>
      <Row>
        {btn("prev", "PREV", ",")}
        {btn("play", "PLAY", "spc")}
        {btn("stop", "STOP", ".")}
        {btn("next", "NEXT", "/")}
      </Row>
      <Row>
        {btn("rwd", "REW", "[")}
        {btn("mute", "MUTE", "m")}
        {btn("fwd", "FWD", "]")}
      </Row>
    </Section>
  )

  const volume = (
    <Section title="Volume" width={colWidth}>
      <Row>
        {btn("vol-down", "VOL-", "-")}
        {btn("vol-up", "VOL+", "=")}
      </Row>
    </Section>
  )

  const footer = (
    <Box marginTop={1}>
      <Text color="gray">tab keyboard · o prefs · q quit</Text>
    </Box>
  )

  if (twoColumn) {
    return (
      <Box flexDirection="column" alignItems="center" width={width}>
        <Box columnGap={4} justifyContent="center">
          <Box flexDirection="column" alignItems="center">
            {system}
            {navigation}
          </Box>
          <Box flexDirection="column" alignItems="center">
            {playback}
            {volume}
          </Box>
        </Box>
        {footer}
      </Box>
    )
  }

  return (
    <Box flexDirection="column" alignItems="center" width={width}>
      {system}
      {navigation}
      {playback}
      {volume}
      {footer}
    </Box>
  )
}

export { RemoteLayout }
