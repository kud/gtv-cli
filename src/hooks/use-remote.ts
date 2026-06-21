import { useEffect, useRef, useState } from "react"
import { createSession, type Session, type SessionState } from "@kud/gtv"

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
const useRemote = () => {
  const [state, setState] = useState<SessionState>(initialState)
  const sessionRef = useRef<Session | null>(null)

  useEffect(() => {
    const session = createSession()
    sessionRef.current = session
    setState({ ...session.state })
    session.on("change", (next) => setState({ ...next }))
    return () => session.stop()
  }, [])

  const sendKey = (keyCode: number, direction?: number) =>
    sessionRef.current?.sendKey(keyCode, direction)
  const typeText = (text: string) => sessionRef.current?.typeText(text)
  const launchApp = (link: string) => sessionRef.current?.launchApp(link)

  return { state, sendKey, typeText, launchApp }
}

export { useRemote, type SessionState as RemoteState }
