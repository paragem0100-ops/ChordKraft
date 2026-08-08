/**
 * ChordMap Pro - Core State Store & Storage Persistence
 */

export const DEFAULT_SONGS = [
  {
    id: 'song-demo-1',
    title: 'De Música Ligera',
    artist: 'Soda Stereo',
    originalKey: 'Bm',
    currentKey: 'Bm',
    tuning: 'Standard (E A D G B E)',
    bpm: 125,
    timeSignature: '4/4',
    structure: [
      { id: 'sec-101', name: 'INTRO', color: '#bb86fc', chords: 'Bm | G | D | A', notes: 'Riff principal de guitarra con distorsión potente.' },
      { id: 'sec-102', name: 'ESTROFA 1', color: '#03dac6', chords: 'Bm | G | D | A | Bm | G | D | A', notes: 'Ella durmió al calor de las masas...' },
      { id: 'sec-103', name: 'ESTROFA 2', color: '#03dac6', chords: 'Bm | G | D | A | Bm | G | D | A', notes: 'No hay nada más que decir...' },
      { id: 'sec-104', name: 'CORO', color: '#cf6679', chords: 'Bm | G | D | A | Bm | G | D | A', notes: 'De aquel amor de música ligera...' },
      { id: 'sec-105', name: 'SOLO', color: '#ffb74d', chords: 'Bm | G | D | A | Bm | G | D | A', notes: 'Solo de guitarra Gustavo Cerati.' },
      { id: 'sec-106', name: 'OUTRO', color: '#ba68c8', chords: 'Bm | G | D | A | Bm | N.C.', notes: '¡Nada más queda! Final seco.' }
    ]
  },
  {
    id: 'song-demo-2',
    title: 'Crimen',
    artist: 'Gustavo Cerati',
    originalKey: 'C',
    currentKey: 'C',
    tuning: 'Standard',
    bpm: 78,
    timeSignature: '4/4',
    structure: [
      { id: 'sec-201', name: 'INTRO PIANO', color: '#bb86fc', chords: 'C | Em | F | Fm', notes: 'Melodía suave de piano.' },
      { id: 'sec-202', name: 'VERSO 1', color: '#03dac6', chords: 'C | Em | F | Fm | Am | Am/G | F | G', notes: 'La espera me agotó...' },
      { id: 'sec-203', name: 'CORO', color: '#cf6679', chords: 'F | G | C | Am | F | Fm | C | C', notes: '¿Qué otra cosa puedo hacer? Es un crimen...' }
    ]
  }
];

export const AppState = {
  songs: [],
  setlists: [
    { id: 'all-songs', name: '🌌 Repercusión Total (Todas las Canciones)', songIds: [] }
  ],
  activeSetlistId: 'all-songs',
  currentSongId: null,
  isLiveMode: false,
  isMuted: false,
  isMetronomeRunning: false,
  metronomeBeatCount: 0,
  bandLogoBase64: null,
  wakeLock: null,
  activeChordInputBox: null,
  playingSectionId: null,
  activeLiveSectionId: null,
  metronomeTimer: null,
  tapTimes: [],
  theme: 'cosmic'
};

export function saveSongsToStorage() {
  localStorage.setItem('chordmap_songs', JSON.stringify(AppState.songs));
}

export function saveSetlistsToStorage() {
  localStorage.setItem('chordmap_setlists', JSON.stringify(AppState.setlists));
}

export function getCurrentSong() {
  if (!AppState.songs || AppState.songs.length === 0) return null;
  return AppState.songs.find(s => s.id === AppState.currentSongId) || AppState.songs[0];
}

export function loadDataFromStorage() {
  const savedSongs = localStorage.getItem('chordmap_songs');
  if (savedSongs) {
    try {
      AppState.songs = JSON.parse(savedSongs);
    } catch (e) {
      AppState.songs = DEFAULT_SONGS;
    }
  }

  if (!AppState.songs || AppState.songs.length === 0) {
    AppState.songs = DEFAULT_SONGS;
    saveSongsToStorage();
  }

  const savedSetlists = localStorage.getItem('chordmap_setlists');
  if (savedSetlists) {
    try { AppState.setlists = JSON.parse(savedSetlists); } catch (e) {}
  }

  if (!AppState.setlists || AppState.setlists.length === 0) {
    AppState.setlists = [
      { id: 'all-songs', name: '🌌 Repercusión Total (Todas las Canciones)', songIds: [] }
    ];
    saveSetlistsToStorage();
  }

  const savedTheme = localStorage.getItem('chordmap_theme');
  AppState.theme = savedTheme || 'cosmic';

  const savedLogo = localStorage.getItem('chordmap_band_logo');
  if (savedLogo) {
    AppState.bandLogoBase64 = savedLogo;
  }

  if (AppState.songs.length > 0) {
    if (!AppState.currentSongId || !AppState.songs.some(s => s.id === AppState.currentSongId)) {
      AppState.currentSongId = AppState.songs[0].id;
    }
  }
}
