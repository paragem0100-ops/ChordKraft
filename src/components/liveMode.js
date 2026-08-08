/**
 * ChordMap Pro - Live Mode Stage Component
 */

import { AppState, getCurrentSong } from '../core/state.js';
import { themeIcon } from '../core/theme.js';

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function toggleLiveMode(exitOnly = false) {
  const overlay = document.getElementById('liveModeOverlay');
  const toggleBtn = document.getElementById('btnToggleLiveMode');
  if (!overlay) return;

  if (exitOnly) {
    AppState.isLiveMode = false;
  } else {
    AppState.isLiveMode = !AppState.isLiveMode;
  }

  if (AppState.isLiveMode) {
    overlay.classList.add('active');
    if (toggleBtn) toggleBtn.classList.add('live');
    renderLiveModeContent();
  } else {
    overlay.classList.remove('active');
    if (toggleBtn) toggleBtn.classList.remove('live');
  }
}

export function renderLiveModeContent() {
  const song = getCurrentSong();
  if (!song) return;

  const title = document.getElementById('liveSongTitle');
  if (title) title.textContent = song.title || 'Sin Título';

  const artist = document.getElementById('liveSongArtist');
  if (artist) artist.textContent = song.artist || 'Banda / Artista';

  const key = document.getElementById('liveSongKey');
  if (key) key.textContent = song.currentKey || song.originalKey || 'C';

  const tuning = document.getElementById('liveSongTuning');
  if (tuning) tuning.textContent = song.tuning || 'Standard';

  const bpm = document.getElementById('liveSongBpm');
  if (bpm) bpm.textContent = song.bpm || '120';

  const liveContent = document.getElementById('liveContent') || document.getElementById('liveChordsDisplay');
  if (!liveContent) return;

  const structure = song.structure || song.sections || [];

  if (structure.length === 0) {
    liveContent.innerHTML = '<div style="text-align:center; padding: 60px; color: var(--text-muted); font-size: 1.2rem;">Sin secciones configuradas en esta canción.</div>';
    return;
  }

  let html = '<div class="live-sections-wrapper" style="display: flex; flex-direction: column; gap: 24px; padding: 20px 30px; overflow-y: auto; max-height: calc(100vh - 160px);">';

  structure.forEach((sec) => {
    html += `
      <div class="live-section-block" style="background: rgba(18, 10, 32, 0.75); border: 2px solid ${sec.color || '#c084fc'}; border-radius: 16px; padding: 20px 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 10px;">
          <h3 style="font-size: 1.8rem; font-weight: 800; text-transform: uppercase; color: ${sec.color || '#fff'}; margin: 0; letter-spacing: 0.05em;">${escapeHTML(sec.name)}</h3>
          ${sec.notes ? `<span style="color: var(--text-muted); font-size: 1.05rem; font-style: italic;">${escapeHTML(sec.notes)}</span>` : ''}
        </div>
        ${formatLiveChordsGridHTML(sec.chords)}
      </div>
    `;
  });

  html += '</div>';
  liveContent.innerHTML = html;
}

function formatLiveChordsGridHTML(chordsText) {
  if (!chordsText) return '';
  const lines = chordsText.split('\n');

  let html = '<div class="live-chords-grid" style="display: flex; flex-direction: column; gap: 14px;">';

  lines.forEach(line => {
    if (!line.trim()) return;
    html += '<div class="live-line-row" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">';
    const measures = line.split('|');

    measures.forEach((measureStr, mIdx) => {
      const chords = measureStr.trim().split(/\s+/).filter(c => c.length > 0);
      html += '<div class="live-measure-box" style="display: inline-flex; align-items: center; gap: 10px; border: 2px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 16px; background: rgba(30, 15, 50, 0.6);">';
      chords.forEach(chord => {
        html += `<span class="live-chord-giant" style="font-family: var(--font-chords); font-size: 2.2rem; font-weight: 800; color: #ffffff; background: rgba(192, 132, 252, 0.25); padding: 8px 18px; border-radius: 10px; border: 1.5px solid var(--accent-purple); text-shadow: 0 0 10px rgba(192,132,252,0.5);">${escapeHTML(chord)}</span>`;
      });
      html += '</div>';

      if (mIdx < measures.length - 1) {
        html += '<span style="color: rgba(255,255,255,0.3); font-size: 2.2rem; font-weight: 300;">|</span>';
      }
    });

    html += '</div>';
  });

  html += '</div>';
  return html;
}

export function navigateLiveSong(direction) {
  if (!AppState.songs || AppState.songs.length === 0) return;

  let activeSongIds = AppState.songs.map(s => s.id);
  const activeSetlist = AppState.setlists.find(st => st.id === AppState.activeSetlistId);
  if (activeSetlist && activeSetlist.songIds && activeSetlist.songIds.length > 0) {
    activeSongIds = activeSetlist.songIds;
  }

  const currentIdx = activeSongIds.indexOf(AppState.currentSongId);
  let nextIdx = currentIdx + direction;

  if (nextIdx < 0) nextIdx = activeSongIds.length - 1;
  if (nextIdx >= activeSongIds.length) nextIdx = 0;

  AppState.currentSongId = activeSongIds[nextIdx];
  renderLiveModeContent();
}
