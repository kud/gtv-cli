declare module "androidtv-remote" {
  import { EventEmitter } from "node:events"

  interface Cert {
    key: string
    cert: string
  }

  interface RemoteOptions {
    pairing_port?: number
    remote_port?: number
    service_name?: string
    cert?: Cert
  }

  interface VolumeInfo {
    level: number
    maximum: number
    muted: boolean
  }

  interface RemoteKeyCodeMap {
    KEYCODE_HOME: number
    KEYCODE_BACK: number
    KEYCODE_POWER: number
    KEYCODE_ENTER: number
    KEYCODE_DPAD_UP: number
    KEYCODE_DPAD_DOWN: number
    KEYCODE_DPAD_LEFT: number
    KEYCODE_DPAD_RIGHT: number
    KEYCODE_DPAD_CENTER: number
    KEYCODE_VOLUME_UP: number
    KEYCODE_VOLUME_DOWN: number
    KEYCODE_VOLUME_MUTE: number
    KEYCODE_MUTE: number
    KEYCODE_MEDIA_PLAY_PAUSE: number
    KEYCODE_MEDIA_PLAY: number
    KEYCODE_MEDIA_PAUSE: number
    KEYCODE_MEDIA_STOP: number
    KEYCODE_MEDIA_NEXT: number
    KEYCODE_MEDIA_PREVIOUS: number
    KEYCODE_MEDIA_REWIND: number
    KEYCODE_MEDIA_FAST_FORWARD: number
    KEYCODE_MEDIA_RECORD: number
    KEYCODE_MEDIA_CLOSE: number
    KEYCODE_MEDIA_EJECT: number
    KEYCODE_MENU: number
    KEYCODE_SEARCH: number
    KEYCODE_SETTINGS: number
    KEYCODE_INFO: number
    KEYCODE_GUIDE: number
    KEYCODE_SLEEP: number
    KEYCODE_WAKEUP: number
    KEYCODE_TV_INPUT: number
    KEYCODE_TV_INPUT_HDMI_1: number
    KEYCODE_TV_INPUT_HDMI_2: number
    KEYCODE_TV_INPUT_HDMI_3: number
    KEYCODE_TV_INPUT_HDMI_4: number
    KEYCODE_CHANNEL_UP: number
    KEYCODE_CHANNEL_DOWN: number
    KEYCODE_MEDIA_TOP_MENU: number
    KEYCODE_MEDIA_AUDIO_TRACK: number
    KEYCODE_DPAD_UP_LEFT: number
    KEYCODE_DPAD_DOWN_LEFT: number
    KEYCODE_DPAD_UP_RIGHT: number
    KEYCODE_DPAD_DOWN_RIGHT: number
    [key: string]: number
  }

  interface RemoteDirectionMap {
    SHORT: number
    START_LONG: number
    END_LONG: number
    UNKNOWN_DIRECTION: number
    [key: string]: number
  }

  class AndroidRemote extends EventEmitter {
    constructor(host: string, options?: RemoteOptions)
    start(): Promise<boolean>
    stop(): void
    sendCode(code: string): void
    sendKey(key: number, direction: number): void
    sendAppLink(appLink: string): void
    sendPower(): void
    getCertificate(): Cert

    on(event: "ready", listener: () => void): this
    on(event: "secret", listener: () => void): this
    on(event: "unpaired", listener: () => void): this
    on(event: "powered", listener: (powered: boolean) => void): this
    on(event: "volume", listener: (volume: VolumeInfo) => void): this
    on(event: "current_app", listener: (app: string) => void): this
    on(event: "error", listener: (err: Error) => void): this
    on(event: string, listener: (...args: unknown[]) => void): this
  }

  const RemoteKeyCode: RemoteKeyCodeMap
  const RemoteDirection: RemoteDirectionMap

  export {
    AndroidRemote,
    RemoteKeyCode,
    RemoteDirection,
    type Cert,
    type VolumeInfo,
  }
}
