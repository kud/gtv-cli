import protobuf from "protobufjs"
import { remoteMessageManager } from "androidtv-remote/dist/remote/RemoteMessageManager.js"
import type { AndroidRemote } from "androidtv-remote"

// The bundled androidtv-remote proto can't express a text edit (its RemoteEditInfo
// has no string field). This is the minimal complete schema needed to *send* one,
// matching Home Assistant's androidtvremote2 implementation.
const IME_PROTO = `
syntax = "proto3";
package gtv;
message RemoteImeObject { int32 start = 1; int32 end = 2; string value = 3; }
message RemoteEditInfo { int32 insert = 1; RemoteImeObject text_field_status = 2; }
message RemoteImeBatchEdit {
  int32 ime_counter = 1;
  int32 field_counter = 2;
  repeated RemoteEditInfo edit_info = 3;
}
message RemoteMessage { RemoteImeBatchEdit remote_ime_batch_edit = 21; }
`

const RemoteMessage = protobuf
  .parse(IME_PROTO)
  .root.lookupType("gtv.RemoteMessage")

// The TV hands us these counters inside remote_ime_batch_edit messages; we echo the
// latest back when sending text. They start at 0 (same default as androidtvremote2).
let imeCounter = 0
let fieldCounter = 0
let tracking = false

const trackImeCounters = (): void => {
  if (tracking) return
  tracking = true

  const original = remoteMessageManager.parse.bind(remoteMessageManager)
  remoteMessageManager.parse = (buffer) => {
    const message = original(buffer)
    // Counter tracking must never throw — it runs inside the library's incoming
    // data handler, and a throw there would silently wedge the live connection.
    try {
      const batch = message["remoteImeBatchEdit"] as
        | { imeCounter?: number; fieldCounter?: number }
        | undefined
      if (batch) {
        if (typeof batch.imeCounter === "number") imeCounter = batch.imeCounter
        if (typeof batch.fieldCounter === "number")
          fieldCounter = batch.fieldCounter
      }
    } catch {
      // ignore — never break message parsing for the sake of observation
    }
    return message
  }
}

type RemoteWithClient = AndroidRemote & {
  remoteManager?: { client?: { write: (data: Uint8Array) => void } }
}

// Sends the whole string to the focused TV text field via the IME edit channel.
const sendImeText = (remote: AndroidRemote, text: string): boolean => {
  const client = (remote as RemoteWithClient).remoteManager?.client
  if (!client || text.length === 0) return false

  const cursor = text.length - 1
  const payload = {
    remoteImeBatchEdit: {
      imeCounter,
      fieldCounter,
      editInfo: [
        {
          insert: 1,
          textFieldStatus: { start: cursor, end: cursor, value: text },
        },
      ],
    },
  }

  const message = RemoteMessage.create(payload)
  client.write(Buffer.from(RemoteMessage.encodeDelimited(message).finish()))
  return true
}

export { sendImeText, trackImeCounters }
