"use client"

import { SpotifyData } from "@/lib/spotify-data"

interface Props {
  connected: boolean
  data: SpotifyData
}

export function DashboardClient({ connected, data }: Props) {
  const tracks = data.topTracks.short_term.slice(0, 10)

  return (
    <div className="container mx-auto py-12 px-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Your Top Tracks</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last 4 weeks · {connected ? "Spotify connected" : "Using mock data"}
      </p>

      <ol className="space-y-3">
        {tracks.map((track, i) => (
          <li
            key={track.id}
            className="flex items-center gap-4 p-3 rounded-md border bg-card"
          >
            <span className="text-muted-foreground font-mono text-sm w-6">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div
              className="w-12 h-12 rounded-md flex-shrink-0"
              style={{ backgroundColor: track.imageColor }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{track.name}</div>
              <div className="text-sm text-muted-foreground truncate">
                {track.artist} · {track.album}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}