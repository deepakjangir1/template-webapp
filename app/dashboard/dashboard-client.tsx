"use client"

import { useState, useMemo } from "react"
import {
  SpotifyData,
  TimeRange,
  genreDistribution,
  diversityScore,
  heatmapFromRecent,
} from "@/lib/spotify-data"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Music2, Headphones, TrendingUp, Clock } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

import { inferMood, archetypeFor } from "@/lib/spotify-data"
import { PersonalityCard } from "./personality-card"
import { Sparkles } from "lucide-react"

interface Props {
  connected: boolean
  data: SpotifyData
  isPro: boolean
}

const TIME_RANGES: { id: TimeRange; label: string; sublabel: string }[] = [
  { id: "short_term", label: "4 weeks", sublabel: "Last month" },
  { id: "medium_term", label: "6 months", sublabel: "This half year" },
  { id: "long_term", label: "All time", sublabel: "Since you joined" },
]

export function DashboardClient({ connected, data, isPro }: Props) {
  const [range, setRange] = useState<TimeRange>("short_term")

  const tracks = data.topTracks[range].slice(0, 10)
  const artists = data.topArtists[range].slice(0, 10)
  const activeRange = TIME_RANGES.find((r) => r.id === range)!
  
  const dist = useMemo(() => genreDistribution(artists), [artists])
  const diversity = useMemo(() => diversityScore(dist), [dist])
  const GENRE_COLORS = ["#FF5B1F", "#E8C547", "#92E5C7", "#C8A2FF", "#FF8FA3", "#FFB347", "#7DD3FC"]
  const genreData = dist.slice(0, 6).map((g, i) => ({
    ...g,
    color: GENRE_COLORS[i],
  }))
  
  
  const heatmap = useMemo(() => heatmapFromRecent(data.recentlyPlayed), [data.recentlyPlayed])
  const heatmapMax = Math.max(1, ...heatmap.flat())
  const peakCell = (() => {
    let best = { day: 0, hour: 0, count: 0 }
    heatmap.forEach((row, d) =>
      row.forEach((v, h) => {
        if (v > best.count) best = { day: d, hour: h, count: v }
      })
    )
    return best
  })()
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const mood = useMemo(() => inferMood(artists), [artists])
  const archetype = useMemo(() => archetypeFor(mood, diversity), [mood, diversity])



  return (
    <div className="container mx-auto py-12 px-6 max-w-5xl">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Hi, {data.displayName}.
        </h1>
        <p className="text-muted-foreground">
          {connected
            ? "Your listening, examined."
            : "Showing mock data · connect Spotify for the real thing"}
        </p>
      </header>

      {/* Time range tabs */}
      <Tabs value={range} onValueChange={(v) => setRange(v as TimeRange)} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          {TIME_RANGES.map((r) => {
            const locked = !isPro && r.id !== "short_term"
            return (
              <TabsTrigger
                key={r.id}
                value={r.id}
                disabled={locked}
                title={locked ? "Pro feature — upgrade to unlock" : undefined}
                className="relative"
              >
                {r.label}
                {locked && (
                  <span className="ml-1.5 text-[10px] opacity-60">🔒</span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {!isPro && (
        <div className="mb-6 rounded-lg border border-dashed bg-muted/30 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              You're on the Free plan
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upgrade to Pro to see your top tracks across 6 months and all time, and download your personality card.
            </p>
          </div>
          <a
            href="/upgrade"
            className="text-xs font-medium underline whitespace-nowrap"
          >
            Upgrade →
          </a>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-6">
        Showing your top tracks and artists for: <strong>{activeRange.sublabel}</strong>
      </p>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Tracks */}
        <section className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-5 text-muted-foreground">
            <Music2 size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              Top Tracks
            </h2>
          </div>
          <ol className="space-y-2">
            {tracks.map((t, i) => (
              <li key={t.id} className="flex items-center gap-3 py-1">
                <span className="text-xs text-muted-foreground font-mono w-5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className="w-10 h-10 rounded flex-shrink-0"
                  style={{ backgroundColor: t.imageColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {t.artist}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Top Artists */}
        <section className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-5 text-muted-foreground">
            <Headphones size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              Top Artists
            </h2>
          </div>
          <ol className="space-y-2">
            {artists.map((a, i) => (
              <li key={a.id} className="flex items-center gap-3 py-1">
                <span className="text-xs text-muted-foreground font-mono w-5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: a.imageColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{a.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {a.genres.join(" · ")}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {a.plays}
                </span>
              </li>
            ))}
          </ol>
        </section>
        {/* Genre Breakdown — spans both columns */}
        <section className="rounded-lg border bg-card p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-5 text-muted-foreground">
            <TrendingUp size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              Genre Map
            </h2>
            <span className="ml-auto text-xs font-mono">
              diversity {diversity}/100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-center">
            {/* Donut */}
            <div className="relative w-[200px] h-[200px] mx-auto">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="plays"
                  >
                    {genreData.map((g, i) => (
                      <Cell key={i} fill={g.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-3xl font-bold">{genreData.length}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Genres
                </div>
              </div>
            </div>

            {/* Legend */}
            <ul className="space-y-2">
              {genreData.map((g) => (
                <li key={g.name} className="flex items-center gap-3 text-sm">
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: g.color }}
                  />
                  <span className="flex-1 capitalize">{g.name}</span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {Math.round(g.pct * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground mt-5 italic">
            {diversity > 65
              ? "Wide net — you sample across many scenes."
              : diversity > 40
              ? "Balanced — a clear core with regular detours."
              : "Focused — you know what you like."}
          </p>
        </section>

        {/* Heatmap — spans both columns */}
        <section className="rounded-lg border bg-card p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-5 text-muted-foreground">
            <Clock size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              When You Listen
            </h2>
            <span className="ml-auto text-xs font-mono">
              peak: {DAYS[peakCell.day]} {String(peakCell.hour).padStart(2, "0")}:00
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pt-5">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="h-[18px] text-[10px] text-muted-foreground font-mono flex items-center"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex-1 min-w-[576px]">
              {/* Hour labels */}
              <div className="flex gap-1 mb-1">
                {Array.from({ length: 24 }, (_, h) => (
                  <div
                    key={h}
                    className="w-[18px] text-center text-[10px] text-muted-foreground font-mono"
                  >
                    {h % 6 === 0 ? h : ""}
                  </div>
                ))}
              </div>
              {/* Cells */}
              {heatmap.map((row, dayIdx) => (
                <div key={dayIdx} className="flex gap-1 mb-1">
                  {row.map((count, hour) => {
                    const intensity = count / heatmapMax
                    return (
                      <div
                        key={hour}
                        title={`${DAYS[dayIdx]} ${hour}:00 — ${count} ${
                          count === 1 ? "play" : "plays"
                        }`}
                        className="w-[18px] h-[18px] rounded-sm transition-transform hover:scale-125"
                        style={{
                          backgroundColor:
                            count === 0
                              ? "rgba(255,255,255,0.04)"
                              : `rgba(255, 91, 31, ${0.2 + intensity * 0.8})`,
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-[11px] text-muted-foreground font-mono">
            <span>less</span>
            {[0.2, 0.4, 0.6, 0.8, 1].map((o) => (
              <div
                key={o}
                className="w-[14px] h-[14px] rounded-sm"
                style={{ backgroundColor: `rgba(255, 91, 31, ${o})` }}
              />
            ))}
            <span>more</span>
            <span className="ml-auto italic">based on last 50 plays</span>
          </div>
        </section>


        {/* Personality Card — spans both columns */}
        <section className="rounded-lg border bg-card p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-5 text-muted-foreground">
            <Sparkles size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              Your Music Personality
            </h2>
            <span className="ml-auto text-xs font-mono">shareable</span>
          </div>

          <PersonalityCard
            displayName={data.displayName}
            archetype={archetype}
            mood={mood}
            topTrack={tracks[0]}
            topArtist={artists[0]}
            diversity={diversity}
            rangeLabel={activeRange.label}
            canDownload={isPro}
          />
        </section>

      </div>
    </div>
  )
}