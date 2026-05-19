"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  Archetype,
  MoodProfile,
  Track,
  Artist,
} from "@/lib/spotify-data"

interface Props {
  displayName: string
  archetype: Archetype
  mood: MoodProfile
  topTrack?: Track
  topArtist?: Artist
  diversity: number
  rangeLabel: string
  canDownload: boolean // pro-gating
}

export function PersonalityCard({
  displayName,
  archetype,
  mood,
  topTrack,
  topArtist,
  diversity,
  rangeLabel,
  canDownload,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  const handleDownload = () => {
    const svg = svgRef.current
    if (!svg) return
    const serialized = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const scale = 2
      const canvas = document.createElement("canvas")
      canvas.width = 600 * scale
      canvas.height = 900 * scale
      const ctx = canvas.getContext("2d")!
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0, 600, 900)
      canvas.toBlob((b) => {
        if (!b) return
        const a = document.createElement("a")
        a.href = URL.createObjectURL(b)
        a.download = `sonic-signature-${displayName.toLowerCase().replace(/\s+/g, "-")}.png`
        a.click()
        URL.revokeObjectURL(url)
      })
    }
    img.src = url
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        viewBox="0 0 600 900"
        width="100%"
        style={{ maxWidth: 360, display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1A1816" />
            <stop offset="100%" stopColor="#0F0E0C" />
          </linearGradient>
          <radialGradient id="card-glow" cx="50%" cy="35%" r="40%">
            <stop offset="0%" stopColor="#FF5B1F" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF5B1F" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="600" height="900" fill="url(#card-bg)" />
        <rect width="600" height="900" fill="url(#card-glow)" />

        {/* Header */}
        <text x="40" y="60" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="3" fill="#7A7268">
          SONIC SIGNATURE — {rangeLabel.toUpperCase()}
        </text>
        <line x1="40" y1="78" x2="560" y2="78" stroke="#3A352F" strokeWidth="1" />

        {/* Archetype */}
        <text x="40" y="160" fontFamily="ui-monospace, monospace" fontSize="14" letterSpacing="2" fill="#FF5B1F">
          YOU ARE
        </text>
        <text x="40" y="220" fontFamily="Georgia, serif" fontSize="42" fontWeight="500" fill="#F4EBDD" fontStyle="italic">
          {archetype.name}
        </text>
        <text x="40" y="252" fontFamily="Georgia, serif" fontSize="18" fill="#A89F92" fontStyle="italic">
          — {archetype.tagline}
        </text>

        {/* Vinyl visual */}
        <circle cx="450" cy="380" r="90" fill="#FF5B1F" opacity="0.15" />
        <circle cx="450" cy="380" r="70" fill="none" stroke="#FF5B1F" strokeWidth="1" opacity="0.4" />
        <circle cx="450" cy="380" r="50" fill="none" stroke="#FF5B1F" strokeWidth="1" opacity="0.5" />
        <circle cx="450" cy="380" r="25" fill="#FF5B1F" />
        <circle cx="450" cy="380" r="6" fill="#0F0E0C" />

        {/* Top items */}
        <text x="40" y="380" fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="2" fill="#7A7268">
          TOP ARTIST
        </text>
        <text x="40" y="408" fontFamily="Georgia, serif" fontSize="24" fill="#F4EBDD">
          {topArtist?.name ?? "—"}
        </text>

        <text x="40" y="460" fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="2" fill="#7A7268">
          TOP TRACK
        </text>
        <text x="40" y="488" fontFamily="Georgia, serif" fontSize="22" fill="#F4EBDD">
          {topTrack?.name ?? "—"}
        </text>

        {/* Mood bars */}
        <text x="40" y="560" fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="2" fill="#7A7268">
          MOOD PROFILE
        </text>
        {[
          { label: "energy", val: mood.energy },
          { label: "happiness", val: mood.valence },
          { label: "diversity", val: diversity / 100 },
        ].map((f, i) => (
          <g key={f.label}>
            <text
              x="40"
              y={600 + i * 36}
              fontFamily="ui-monospace, monospace"
              fontSize="11"
              fill="#A89F92"
            >
              {f.label}
            </text>
            <rect x="180" y={590 + i * 36} width="340" height="6" rx="3" fill="#2A2622" />
            <rect x="180" y={590 + i * 36} width={340 * f.val} height="6" rx="3" fill="#FF5B1F" />
            <text
              x="530"
              y={600 + i * 36}
              fontFamily="ui-monospace, monospace"
              fontSize="11"
              fill="#F4EBDD"
              textAnchor="end"
            >
              {Math.round(f.val * 100)}
            </text>
          </g>
        ))}

        {/* Footer */}
        <line x1="40" y1="780" x2="560" y2="780" stroke="#3A352F" strokeWidth="1" />
        <text x="40" y="820" fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="2" fill="#7A7268">
          LISTENER
        </text>
        <text x="40" y="855" fontFamily="Georgia, serif" fontSize="28" fill="#F4EBDD">
          {displayName}
        </text>
        <text x="560" y="855" fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="2" fill="#7A7268" textAnchor="end">
          stats.fm.clone
        </text>
      </svg>

      <Button onClick={handleDownload} disabled={!canDownload} className="mt-6 gap-2">
        <Download size={14} />
        {canDownload ? "Download as PNG" : "Pro feature — Upgrade to download"}
      </Button>

      {!canDownload && (
        <p className="text-xs text-muted-foreground mt-2 italic">
          You can see your card any time. Downloading is a Pro perk.
        </p>
      )}
    </div>
  )
}