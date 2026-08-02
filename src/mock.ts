import type { AppEntry, SessionState } from "@kud/gtv"

// A Google TV that does not exist, for screenshots and demos.
//
// Every name here is invented. That is the point: the alternative is
// screenshotting a real living room — the TV's name, the apps installed on it,
// and whatever happens to be playing say more about someone than they usually
// intend, and a screenshot outlives the moment it was taken.
export const mockState = (): SessionState => ({
  tvName: "Living Room",
  host: "192.0.2.42",
  connected: true,
  powered: true,
  // Deliberately not muted and not at a round number: a status bar that only
  // ever renders 0 or 100 hides how it handles the ordinary case.
  volume: { level: 17, maximum: 100, muted: false },
  currentApp: "Netflix",
  error: null,
})

// Enough entries that the launcher scrolls and filters like a real one, drawn
// from apps common enough that nobody has to wonder whose TV this is.
export const mockApps = (): AppEntry[] => [
  { id: "netflix", name: "Netflix", packageName: "com.netflix.ninja" },
  {
    id: "youtube",
    name: "YouTube",
    packageName: "com.google.android.youtube.tv",
  },
  {
    id: "primevideo",
    name: "Prime Video",
    packageName: "com.amazon.amazonvideo.livingroom",
  },
  { id: "disneyplus", name: "Disney+", packageName: "com.disney.disneyplus" },
  { id: "arte", name: "ARTE", packageName: "tv.arte.plus7" },
  { id: "plex", name: "Plex", packageName: "com.plexapp.android" },
  { id: "spotify", name: "Spotify", packageName: "com.spotify.tv.android" },
  { id: "twitch", name: "Twitch", packageName: "tv.twitch.android.app" },
]
