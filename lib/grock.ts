// Lightweight local "grock" generator — returns a music policy and k mock tracks
export type Policy = {
  tempo: number;
  energy: number;
  valence: number;
  genres: string[];
};

export function generatePlaylist(emotion: string, mode: "reflect" | "work" | undefined, k = 10) {
  // Simple heuristic mapping from emotion to music profile
  const e = (emotion || "neutral").toLowerCase();

  let tempo = 100;
  let energy = 0.5;
  let valence = 0.5;
  let genres: string[] = ["indie"];

  if (e.includes("happy") || e.includes("joy") || e.includes("excited")) {
    tempo = 130;
    energy = 0.8;
    valence = 0.9;
    genres = ["pop", "dance"];
  } else if (e.includes("sad") || e.includes("down") || e.includes("blue")) {
    tempo = 70;
    energy = 0.25;
    valence = 0.2;
    genres = ["ambient", "singer-songwriter"];
  } else if (e.includes("calm") || e.includes("relaxed") || e.includes("peace")) {
    tempo = 80;
    energy = 0.3;
    valence = 0.6;
    genres = ["chill", "ambient"];
  } else if (e.includes("angry") || e.includes("frustrat") || e.includes("stressed")) {
    tempo = 150;
    energy = 0.9;
    valence = 0.3;
    genres = ["rock", "electronic"];
  } else if (e.includes("focused") || e.includes("work") || e.includes("productive")) {
    tempo = 110;
    energy = 0.6;
    valence = 0.6;
    genres = ["electronic", "instrumental"];
  }

  // If mode indicates opposite/working with mood, nudge values
  if (mode === "work") {
    tempo = Math.round(tempo * 1.05);
    energy = Math.min(1, energy + 0.05);
  }

  const policy: Policy = { tempo, energy, valence, genres };

  // We have a small curated dataset of real songs with approximate metadata.
  // The generator will find the nearest k real tracks to the desired policy.
  type TrackEntry = {
    metadata: {
      title: string;
      artist: string;
      tempo?: number;
      energy?: number;
      valence?: number;
      genre?: string;
    };
    id?: string;
    distance?: number;
  };

  const candidates: TrackEntry[] = REAL_TRACKS.map((t) => ({ ...t }));

  const scored: TrackEntry[] = candidates.map((t: TrackEntry) => {
    // compute distance over tempo (normalized), energy, valence
    const tempoNorm = policy.tempo / 200; // normalize by 200 BPM
    const tTempoNorm = (t.metadata.tempo || policy.tempo) / 200;
    const dTempo = tempoNorm - tTempoNorm;
    const dEnergy = policy.energy - (t.metadata.energy ?? policy.energy);
    const dValence = policy.valence - (t.metadata.valence ?? policy.valence);

    let dist = Math.sqrt(dTempo * dTempo + dEnergy * dEnergy + dValence * dValence);

    // reward genre match (reduce distance)
    if (policy.genres && t.metadata.genre && policy.genres.includes(t.metadata.genre)) {
      dist *= 0.8;
    }

    return { ...t, distance: clamp(dist, 0, 1) } as TrackEntry;
  });

  // sort by distance ascending and take k
  const items = scored
    .sort((a: TrackEntry, b: TrackEntry) => (a.distance ?? 1) - (b.distance ?? 1))
    .slice(0, k)
    .map((t: TrackEntry, i: number) => ({ ...t, id: `real-${i}-${t.metadata.title.replace(/\s+/g, "-").toLowerCase()}` }));

  return { policy, items };
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simple normal-ish random via Box–Muller
function randomNormal(mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * std + mean;
}

// --- curated real track dataset ---
const REAL_TRACKS: Array<{
  metadata: {
    title: string;
    artist: string;
    tempo?: number;
    energy?: number;
    valence?: number;
    genre?: string;
  };
}> = [
  { metadata: { title: "Happy", artist: "Pharrell Williams", tempo: 160, energy: 0.9, valence: 0.95, genre: "pop" } },
  { metadata: { title: "Get Lucky", artist: "Daft Punk", tempo: 116, energy: 0.8, valence: 0.9, genre: "dance" } },
  { metadata: { title: "Shake It Off", artist: "Taylor Swift", tempo: 160, energy: 0.9, valence: 0.9, genre: "pop" } },
  { metadata: { title: "Someone Like You", artist: "Adele", tempo: 67, energy: 0.2, valence: 0.15, genre: "singer-songwriter" } },
  { metadata: { title: "Stay With Me", artist: "Sam Smith", tempo: 84, energy: 0.3, valence: 0.2, genre: "singer-songwriter" } },
  { metadata: { title: "Creep", artist: "Radiohead", tempo: 92, energy: 0.35, valence: 0.15, genre: "alternative" } },
  { metadata: { title: "Don't Know Why", artist: "Norah Jones", tempo: 92, energy: 0.25, valence: 0.6, genre: "jazz" } },
  { metadata: { title: "Holocene", artist: "Bon Iver", tempo: 70, energy: 0.25, valence: 0.5, genre: "folk" } },
  { metadata: { title: "Smooth Operator", artist: "Sade", tempo: 87, energy: 0.4, valence: 0.6, genre: "soul" } },
  { metadata: { title: "In the End", artist: "Linkin Park", tempo: 105, energy: 0.85, valence: 0.35, genre: "rock" } },
  { metadata: { title: "Killing in the Name", artist: "Rage Against the Machine", tempo: 107, energy: 0.95, valence: 0.2, genre: "rock" } },
  { metadata: { title: "Enter Sandman", artist: "Metallica", tempo: 123, energy: 0.95, valence: 0.3, genre: "metal" } },
  { metadata: { title: "Nuvole Bianche", artist: "Ludovico Einaudi", tempo: 72, energy: 0.15, valence: 0.55, genre: "instrumental" } },
  { metadata: { title: "Time", artist: "Hans Zimmer", tempo: 65, energy: 0.25, valence: 0.6, genre: "instrumental" } },
  { metadata: { title: "Blinding Lights", artist: "The Weeknd", tempo: 171, energy: 0.88, valence: 0.8, genre: "pop" } },
  { metadata: { title: "Fix You", artist: "Coldplay", tempo: 138, energy: 0.4, valence: 0.35, genre: "alternative" } },
  { metadata: { title: "Someone You Loved", artist: "Lewis Capaldi", tempo: 110, energy: 0.35, valence: 0.2, genre: "singer-songwriter" } },
  { metadata: { title: "Sunflower", artist: "Post Malone", tempo: 90, energy: 0.6, valence: 0.7, genre: "pop" } },
  { metadata: { title: "Lovely", artist: "Billie Eilish", tempo: 112, energy: 0.35, valence: 0.25, genre: "alternative" } },
  { metadata: { title: "Weightless", artist: "Marconi Union", tempo: 60, energy: 0.1, valence: 0.5, genre: "ambient" } },
  { metadata: { title: "Dreams", artist: "Fleetwood Mac", tempo: 120, energy: 0.5, valence: 0.6, genre: "rock" } },
  { metadata: { title: "Bad Guy", artist: "Billie Eilish", tempo: 135, energy: 0.75, valence: 0.35, genre: "pop" } },
  { metadata: { title: "Electric Feel", artist: "MGMT", tempo: 100, energy: 0.7, valence: 0.7, genre: "indie" } },
  { metadata: { title: "River", artist: "Leon Bridges", tempo: 84, energy: 0.35, valence: 0.4, genre: "soul" } },
  { metadata: { title: "Hallelujah", artist: "Jeff Buckley", tempo: 56, energy: 0.15, valence: 0.25, genre: "folk" } },
  { metadata: { title: "Lose Yourself", artist: "Eminem", tempo: 171, energy: 0.95, valence: 0.4, genre: "hip-hop" } },
  { metadata: { title: "Comfortably Numb", artist: "Pink Floyd", tempo: 127, energy: 0.4, valence: 0.35, genre: "rock" } },
  { metadata: { title: "Nocturne", artist: "Chopin", tempo: 52, energy: 0.05, valence: 0.5, genre: "classical" } },
];
