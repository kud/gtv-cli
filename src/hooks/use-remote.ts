import { useEffect, useRef, useState } from "react"
import { createSession, type Session, type SessionState } from "@kud/gtv"
import { mockState } from "../mock.js"

const initialState: SessionState = {
  tvName: null,
  host: null,
  connected: false,
  powered: null,
  volume: null,
  currentApp: null,
  error: null,
}

// Thin React adapter over @kud/gtv's framework-agnostic session: subscribe to
// `change`, mirror into React state, and forward send calls.
// In mock mode no session is opened at all, so nothing reaches the network and
// the keys are inert — sessionRef stays null and every send already optional-
// chains through it. Half-mocking would be worse than not offering it: a
// screenshot showing invented state while quietly driving a real television is
// the one outcome this exists to prevent.
const useRemote = (mock = false) => {
  const [state, setState] = useState<SessionState>(
    mock ? mockState() : initialState,
  )
  const sessionRef = useRef<Session | null>(null)

  useEffect(() => {
    if (mock) return
    const session = createSession()
    sessionRef.current = session
    setState({ ...session.state })
    session.on("change", (next) => setState({ ...next }))
    return () => session.stop()
  }, [mock])

  const sendKey = (keyCode: number, direction?: number) =>
    sessionRef.current?.sendKey(keyCode, direction)
  const typeText = (text: string) => sessionRef.current?.typeText(text)
  const launchApp = (link: string) => sessionRef.current?.launchApp(link)

  return { state, sendKey, typeText, launchApp }
}

export { useRemote, type SessionState as RemoteState }
