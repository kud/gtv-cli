#!/usr/bin/env node
// Run React's production build unless the caller chose otherwise. This must
// happen before react or ink is loaded, hence the dynamic import below.
process.env.NODE_ENV ??= "production"

await import("./index.js")

export {}
