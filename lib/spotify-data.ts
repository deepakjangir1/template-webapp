// lib/spotify-data.ts
//
// Data layer for Spotify stats. Right now returns realistic mock data.
// When Spotify Premium is available, swap the body of getSpotifyData() to
// call the real Spotify Web API — the component contract stays the same.
//
// Why mock: the Spotify Web API requires the app owner's account to have
// active Spotify Premium (policy change, Feb 2026). To unblock UI work,
// the data layer is mocked. The shape mirrors Spotify's real responses.

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  durationMs: number;
  popularity: number;
  imageColor: string; // for the SVG album-art placeholder
}

export interface Artist {
  id: string;
  name: string;
  genres: string[];
  plays: number;
  imageColor: string;
}

export interface RecentPlay {
  trackName: string;
  artistName: string;
  playedAt: string; // ISO timestamp
}

export interface SpotifyData {
  displayName: string;
  topTracks: Record<TimeRange, Track[]>;
  topArtists: Record<TimeRange, Artist[]>;
  recentlyPlayed: RecentPlay[];
}

// ---------- Mock catalog ----------

const COLORS = ['#FF5B1F', '#E8C547', '#92E5C7', '#C8A2FF', '#FF8FA3', '#FFB347', '#7DD3FC', '#F472B6', '#A78BFA', '#34D399'];

const TRACK_NAMES_SHORT = [
  ['Night Drift', 'Solène Vance', 'Lantern Year'],
  ['Velvet Static', 'Atlas Foley', 'Half Light'],
  ['Paper Aeroplanes', 'Mira Otsuka', 'Closer to Salt'],
  ['Closer to Salt', 'The Hollow Wing', 'Closer to Salt'],
  ['Slowdancer', 'Juno Bell', 'Slowdancer EP'],
  ['Cassette Heart', 'Atlas Foley', 'Half Light'],
  ['Ferris Wheel', 'Mira Otsuka', 'Closer to Salt'],
  ['Indigo Run', 'Solène Vance', 'Lantern Year'],
  ['Tin Foil Crown', 'Atlas Foley', 'Half Light'],
  ['Glass Door Goodbye', 'Solène Vance', 'Lantern Year'],
];

const TRACK_NAMES_MID = [
  ['Velvet Static', 'Atlas Foley', 'Half Light'],
  ['Lantern Year', 'The Hollow Wing', 'Lantern Year'],
  ['Postcards from Nowhere', 'Wren Halloway', 'The Long Way Round'],
  ['Paper Aeroplanes', 'Mira Otsuka', 'Closer to Salt'],
  ['Open Mic Witness', 'June & The Tides', 'Mountain Mouth'],
  ['Glass Door Goodbye', 'Solène Vance', 'Lantern Year'],
  ['Tin Foil Crown', 'Atlas Foley', 'Half Light'],
  ['Half Light', 'Mira Otsuka', 'Closer to Salt'],
  ['Sleeping Engines', 'Atlas Foley', 'Half Light'],
  ['Mountain Mouth', 'June & The Tides', 'Mountain Mouth'],
];

const TRACK_NAMES_LONG = [
  ['Lantern Year', 'The Hollow Wing', 'Lantern Year'],
  ['Mountain Mouth', 'June & The Tides', 'Mountain Mouth'],
  ['Velvet Static', 'Atlas Foley', 'Half Light'],
  ['The Long Way Round', 'Wren Halloway', 'The Long Way Round'],
  ['Glass Door Goodbye', 'Solène Vance', 'Lantern Year'],
  ['Open Mic Witness', 'June & The Tides', 'Mountain Mouth'],
  ['Paper Aeroplanes', 'Mira Otsuka', 'Closer to Salt'],
  ['Sleeping Engines', 'Atlas Foley', 'Half Light'],
  ['Lantern Year', 'The Hollow Wing', 'Lantern Year'],
  ['Tin Foil Crown', 'Atlas Foley', 'Half Light'],
];

const ARTISTS_DATA = [
  { name: 'Atlas Foley', genres: ['indie folk', 'bedroom pop'] },
  { name: 'Solène Vance', genres: ['dream pop', 'shoegaze'] },
  { name: 'Mira Otsuka', genres: ['ambient pop', 'electronic'] },
  { name: 'The Hollow Wing', genres: ['indie folk', 'chamber folk'] },
  { name: 'Juno Bell', genres: ['neo-soul', 'r&b'] },
  { name: 'Wren Halloway', genres: ['indie folk', 'singer-songwriter'] },
  { name: 'June & The Tides', genres: ['folk rock', 'americana'] },
];

function buildTracks(names: string[][], minBase: number): Track[] {
  return names.map(([name, artist, album], i) => ({
    id: `mock-${name.toLowerCase().replace(/\s+/g, '-')}-${i}`,
    name,
    artist,
    album,
    durationMs: (180 + (i * 13) % 90) * 1000,
    popularity: Math.max(20, 80 - i * 5),
    imageColor: COLORS[i % COLORS.length],
  }));
}

function buildArtists(scale: number): Artist[] {
  return ARTISTS_DATA.map((a, i) => ({
    id: `mock-artist-${a.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: a.name,
    genres: a.genres,
    plays: Math.round((220 - i * 18) * scale),
    imageColor: COLORS[i % COLORS.length],
  }));
}

function buildRecent(): RecentPlay[] {
  const out: RecentPlay[] = [];
  const now = Date.now();
  for (let i = 0; i < 50; i++) {
    const t = TRACK_NAMES_SHORT[i % TRACK_NAMES_SHORT.length];
    // Spread plays over the last ~14 days, biased to evenings
    const hour = [8, 9, 13, 18, 19, 20, 21, 22, 23][i % 9];
    const daysAgo = Math.floor(i / 4);
    const d = new Date(now - daysAgo * 86400_000);
    d.setHours(hour, (i * 7) % 60, 0, 0);
    out.push({
      trackName: t[0],
      artistName: t[1],
      playedAt: d.toISOString(),
    });
  }
  return out;
}

// ---------- Public API ----------

/**
 * Returns the user's Spotify stats.
 * Mock implementation today; swap to real Spotify Web API later.
 */
export async function getSpotifyData(userId: string): Promise<SpotifyData> {
  // Simulate network latency so loading states are real
  await new Promise(r => setTimeout(r, 300));

  return {
    displayName: 'Test User',
    topTracks: {
      short_term: buildTracks(TRACK_NAMES_SHORT, 1),
      medium_term: buildTracks(TRACK_NAMES_MID, 1),
      long_term: buildTracks(TRACK_NAMES_LONG, 1),
    },
    topArtists: {
      short_term: buildArtists(1),
      medium_term: buildArtists(3),
      long_term: buildArtists(10),
    },
    recentlyPlayed: buildRecent(),
  };
}

/**
 * Returns true if the user has connected Spotify.
 * Today: looks for a row in spotify_connections (so the connect-button
 * UI still has a real connected/disconnected state).
 * Will keep working unchanged once real Spotify data is live.
 */
export async function hasSpotifyConnection(
  supabase: { from: (table: string) => any },
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('spotify_connections')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

// ---------- Derived metrics ----------

/**
 * Aggregates plays-per-genre across the user's top artists.
 * Each artist contributes its play count to every genre tag it has.
 */
export function genreDistribution(artists: Artist[]) {
  const counts: Record<string, number> = {}
  for (const a of artists) {
    for (const g of a.genres) {
      counts[g] = (counts[g] ?? 0) + a.plays
    }
  }
  const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1
  return Object.entries(counts)
    .map(([name, plays]) => ({ name, plays, pct: plays / total }))
    .sort((a, b) => b.plays - a.plays)
}

/**
 * Shannon entropy of the genre distribution, normalized to 0–100.
 * 0 = you only listen to one genre. 100 = perfectly even spread.
 */
export function diversityScore(dist: { pct: number }[]) {
  if (dist.length <= 1) return 0
  const H = -dist.reduce(
    (s, d) => s + (d.pct > 0 ? d.pct * Math.log(d.pct) : 0),
    0
  )
  const Hmax = Math.log(dist.length)
  return Math.round((H / Hmax) * 100)
}



/**
 * Builds a 7-day × 24-hour grid of play counts from the user's recently-played history.
 * Returns: rows[0] = Monday ... rows[6] = Sunday, each with 24 hour counts.
 *
 * Real Spotify limit: /me/player/recently-played returns only the last 50 plays,
 * so this is a snapshot. A production version would aggregate from a plays table
 * we'd populate via a cron job — noted in README as future work.
 */
export function heatmapFromRecent(plays: RecentPlay[]) {
  // grid[dayIdx][hour] = count. dayIdx 0 = Monday.
  const grid: number[][] = Array.from({ length: 7 }, () =>
    new Array(24).fill(0)
  )
  for (const p of plays) {
    const d = new Date(p.playedAt)
    // JS getDay(): 0=Sun ... 6=Sat. We want 0=Mon ... 6=Sun.
    const dayIdx = (d.getDay() + 6) % 7
    grid[dayIdx][d.getHours()] += 1
  }
  return grid
}

/**
 * Derives a "music personality" archetype from listening signals.
 *
 * Note: real Spotify audio-features (energy/valence/danceability) were
 * deprecated for new apps in Nov 2024. Without them we infer mood from
 * genre tags, which are still available on artist objects.
 */

// Genre → rough mood vector (energy, valence). Curated by hand.
// In a real product this table would have ~500 entries; 30 is enough to demo.
const GENRE_MOODS: Record<string, { energy: number; valence: number }> = {
  "indie folk": { energy: 0.35, valence: 0.5 },
  "bedroom pop": { energy: 0.4, valence: 0.55 },
  "dream pop": { energy: 0.45, valence: 0.45 },
  shoegaze: { energy: 0.55, valence: 0.35 },
  "ambient pop": { energy: 0.3, valence: 0.5 },
  electronic: { energy: 0.7, valence: 0.6 },
  "chamber folk": { energy: 0.25, valence: 0.45 },
  "neo-soul": { energy: 0.5, valence: 0.65 },
  "r&b": { energy: 0.55, valence: 0.6 },
  "singer-songwriter": { energy: 0.3, valence: 0.45 },
  "folk rock": { energy: 0.55, valence: 0.55 },
  americana: { energy: 0.5, valence: 0.55 },
  // Defaults for anything not listed: { energy: 0.5, valence: 0.5 }
}

export interface MoodProfile {
  energy: number // 0–1
  valence: number // 0–1, "happiness"
}

export function inferMood(artists: Artist[]): MoodProfile {
  let totalPlays = 0
  let weightedEnergy = 0
  let weightedValence = 0
  for (const a of artists) {
    for (const g of a.genres) {
      const m = GENRE_MOODS[g] ?? { energy: 0.5, valence: 0.5 }
      weightedEnergy += m.energy * a.plays
      weightedValence += m.valence * a.plays
      totalPlays += a.plays
    }
  }
  if (totalPlays === 0) return { energy: 0.5, valence: 0.5 }
  return {
    energy: weightedEnergy / totalPlays,
    valence: weightedValence / totalPlays,
  }
}

export interface Archetype {
  name: string
  tagline: string
}

/**
 * Maps a mood + diversity score to one of 6 archetypes.
 * Order matters: more specific conditions come first.
 */
export function archetypeFor(mood: MoodProfile, diversity: number): Archetype {
  const { energy, valence } = mood
  if (energy < 0.4 && valence < 0.5)
    return { name: "The Midnight Cartographer", tagline: "maps quiet places" }
  if (energy > 0.65 && valence > 0.6)
    return { name: "The Golden Hour", tagline: "sunlit and certain" }
  if (energy > 0.65)
    return { name: "The Festival Headliner", tagline: "never stops moving" }
  if (diversity > 70)
    return { name: "The Genre Bender", tagline: "lives between stations" }
  if (energy < 0.4)
    return { name: "The Vinyl Archivist", tagline: "collects whispers" }
  return { name: "The Drifter", tagline: "tunes the in-between" }
}