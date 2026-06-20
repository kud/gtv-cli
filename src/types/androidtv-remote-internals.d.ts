declare module "androidtv-remote/dist/remote/RemoteMessageManager.js" {
  const remoteMessageManager: {
    parse(buffer: Buffer): Record<string, unknown> & {
      toJSON?: () => Record<string, unknown>
    }
    create(payload: Record<string, unknown>): Buffer
  }

  export { remoteMessageManager }
}
