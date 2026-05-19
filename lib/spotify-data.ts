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