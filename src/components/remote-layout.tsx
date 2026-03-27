import React from "react"
import { Box, Text } from "ink"

const Btn = ({ label, hint }: { label: string; hint: string }) => (
  <Box borderStyle="single" paddingX={1} minWidth={7} justifyContent="center">
    <Text>{label} </Text>
    <Text color="gray">{hint}</Text>
  </Box>
)

const Row = ({ children }: { children: React.ReactNode }) => (
  <Box gap={1} justifyContent="center">
    {children}
  </Box>
)

const RemoteLayout = () => (
  <Box flexDirection="column" gap={1} alignItems="center" paddingY={1}>
    <Row>
      <Btn label="PWR" hint="p" />
      <Btn label="HOME" hint="h" />
      <Btn label="BACK" hint="⌫" />
      <Btn label="MENU" hint="e" />
      <Btn label="SEARCH" hint="s" />
    </Row>

    <Box flexDirection="column" alignItems="center" gap={1}>
      <Btn label="▲" hint="↑" />
      <Row>
        <Btn label="◄" hint="←" />
        <Btn label="OK" hint="↵" />
        <Btn label="►" hint="→" />
      </Row>
      <Btn label="▼" hint="↓" />
    </Box>

    <Row>
      <Btn label="⏮" hint="," />
      <Btn label="⏯" hint="spc" />
      <Btn label="⏹" hint="." />
      <Btn label="⏭" hint="/" />
    </Row>

    <Row>
      <Btn label="⏪" hint="[" />
      <Btn label="🔇" hint="m" />
      <Btn label="⏩" hint="]" />
    </Row>

    <Row>
      <Btn label="VOL-" hint="-" />
      <Btn label="VOL+" hint="=" />
    </Row>

    <Box marginTop={1}>
      <Text color="gray" dimColor>
        q: quit
      </Text>
    </Box>
  </Box>
)

export { RemoteLayout }
