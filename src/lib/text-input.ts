import { RemoteDirection, type AndroidRemote } from "androidtv-remote"

const KEYCODE_SHIFT_LEFT = 59
const KEYCODE_SPACE = 62
const KEYCODE_DEL = 67
const KEYCODE_ENTER = 66

const LETTERS = "abcdefghijklmnopqrstuvwxyz"
const DIGITS = "0123456789"

const SYMBOLS: Record<string, { code: number; shift?: boolean }> = {
  "'": { code: 75 },
  ",": { code: 55 },
  "-": { code: 69 },
  ".": { code: 56 },
  "/": { code: 76 },
  ";": { code: 74 },
  "=": { code: 70 },
  "[": { code: 71 },
  "\\": { code: 73 },
  "]": { code: 72 },
  "`": { code: 68 },
  "!": { code: 8, shift: true },
  "@": { code: 9, shift: true },
  "#": { code: 10, shift: true },
  "$": { code: 11, shift: true },
  "%": { code: 12, shift: true },
  "^": { code: 13, shift: true },
  "&": { code: 14, shift: true },
  "*": { code: 15, shift: true },
  "(": { code: 16, shift: true },
  ")": { code: 7, shift: true },
  "_": { code: 69, shift: true },
  "+": { code: 70, shift: true },
  "{": { code: 71, shift: true },
  "|": { code: 73, shift: true },
  "}": { code: 72, shift: true },
  ':': { code: 74, shift: true },
  '"': { code: 75, shift: true },
  "<": { code: 55, shift: true },
  ">": { code: 56, shift: true },
  "?": { code: 76, shift: true },
  "~": { code: 68, shift: true },
}

const keyForCharacter = (character: string) => {
  const lower = character.toLowerCase()
  if (LETTERS.includes(lower)) {
    return { code: 29 + LETTERS.indexOf(lower), shift: character !== lower }
  }

  if (DIGITS.includes(character)) return { code: 7 + DIGITS.indexOf(character) }
  if (character === " ") return { code: KEYCODE_SPACE }
  if (character === "\n") return { code: KEYCODE_ENTER }
  return SYMBOLS[character] ?? null
}

const sendText = (remote: AndroidRemote, text: string): void => {
  for (const character of text) {
    const key = keyForCharacter(character)
    if (!key) continue

    if (key.shift) remote.sendKey(KEYCODE_SHIFT_LEFT, RemoteDirection.START_LONG)
    remote.sendKey(key.code, RemoteDirection.SHORT)
    if (key.shift) remote.sendKey(KEYCODE_SHIFT_LEFT, RemoteDirection.END_LONG)
  }
}

export { KEYCODE_DEL, sendText }
