/**
 * ChordMap Pro - Song List & Song Editor Component
 */

import { AppState, saveSongsToStorage, getCurrentSong } from '../core/state.js';
import { themeIcon, themedIconMarkup } from '../core/theme.js';
import { transposeChord, getSemitoneDifference } from '../services/transposer.js';
import { renderSetlistSelect } from '../services/setlists.js';

let isEditingUnlocked = false;

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderSongList(searchQuery = '') {
  const container = document.getElementById('songList');
  if (!container) return;

  container.innerHTML = '';

  let songsToRender = AppState.songs || [];
  const activeSetlist = AppState.setlists.find(s => s.id === AppState.activeSetlistId);
  if (activeSetlist && activeSetlist.songIds && activeSetlist.songIds.length > 0 && activeSetlist.id !== 'all-songs') {
    songsToRender = songsToRender.filter(song => activeSetlist.songIds.includes(song.id));
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    songsToRender = songsToRender.filter(s => 
      (s.title && s.title.toLowerCase().includes(q)) || 
      (s.artist && s.artist.toLowerCase().includes(q))
    );
  }

  if (songsToRender.length === 0) {
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-dim); font-size: 0.88rem;">No hay canciones en este repertorio.</div>';
    return;
  }

  songsToRender.forEach(song => {
    const item = document.createElement('div');
    item.className = `song-item ${song.id === AppState.currentSongId ? 'active' : ''}`;
    item.innerHTML = `
      <div class="song-item-info">
        <h4>${escapeHTML(song.title || 'Sin Título')}</h4>
        <p>${escapeHTML(song.artist || 'Artista Desconocido')}</p>
      </div>
      <span class="song-key-badge">${escapeHTML(song.currentKey || song.originalKey || 'C')}</span>
    `;
    item.addEventListener('click', () => {
      selectSong(song.id);
    });
    container.appendChild(item);
  });
}

export function selectSong(id) {
  const targetSong = AppState.songs.find(s => s.id === id);
  if (!targetSong) return;

  AppState.currentSongId = id;
  renderSongList();
  renderCurrentSong();

  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }
}

export function createNewSong() {
  const newSong = {
    id: 'song-' + Date.now(),
    title: 'Nueva Canción',
    artist: 'Mi Banda',
    originalKey: 'C',
    currentKey: 'C',
    tuning: 'Standard',
    bpm: 120,
    timeSignature: '4/4',
    structure: [
      { id: 'sec-' + Date.now() + '-1', name: 'INTRO', color: '#bb86fc', chords: 'C | G | Am | F', notes: 'Entra con ritmo suave' },
      { id: 'sec-' + Date.now() + '-2', name: 'VERSO', color: '#03dac6', chords: 'C | G | Am | F', notes: 'Voz principal' },
      { id: 'sec-' + Date.now() + '-3', name: 'CORO', color: '#cf6679', chords: 'F | G | C | Am', notes: 'Toda la banda con energía' }
    ]
  };

  AppState.songs.unshift(newSong);
  AppState.currentSongId = newSong.id;
  saveSongsToStorage();
  renderSongList();
  renderCurrentSong();
}

export function renderCurrentSong() {
  const song = getCurrentSong();
  if (!song) return;

  const titleInp = document.getElementById('songTitleInput');
  if (titleInp) titleInp.value = song.title || '';

  const artistInp = document.getElementById('songArtistInput');
  if (artistInp) artistInp.value = song.artist || '';

  const keySel = document.getElementById('keySelect');
  if (keySel) keySel.value = song.currentKey || song.originalKey || 'C';

  const tuningSel = document.getElementById('tuningSelect');
  if (tuningSel) tuningSel.value = song.tuning || 'Standard';

  const bpmInp = document.getElementById('bpmInput');
  if (bpmInp) bpmInp.value = song.bpm || 120;

  renderSections(song);
  updateEditLockUI();
}

function renderSections(song) {
  const container = document.getElementById('sectionsContainer') || document.getElementById('sectionCardsContainer');
  if (!container) return;

  container.innerHTML = '';

  const structure = song.structure || song.sections || [];

  if (structure.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">
      <p style="margin-bottom: 12px;">Esta canción no tiene secciones creadas.</p>
      <button class="btn-new-song" id="btnAddFirstSection"><i class="fa-solid fa-plus"></i> Agregar Primera Sección</button>
    </div>`;
    const btn = document.getElementById('btnAddFirstSection');
    if (btn) btn.addEventListener('click', addSection);
    return;
  }

  structure.forEach((sec) => {
    const card = document.createElement('div');
    card.className = 'section-card';
    card.style.borderLeft = `5px solid ${sec.color || '#bb86fc'}`;

    card.innerHTML = `
      <div class="section-card-header">
        <input type="text" class="input-section-name" value="${escapeHTML(sec.name)}" placeholder="Nombre de sección..." ${!isEditingUnlocked ? 'disabled' : ''} />
        <div class="section-card-actions">
          <input type="color" class="color-picker-custom" value="${sec.color || '#bb86fc'}" title="Color de sección" ${!isEditingUnlocked ? 'disabled' : ''} />
          <button class="btn-icon-action btn-delete-sec" title="Eliminar sección" ${!isEditingUnlocked ? 'disabled' : ''}>
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="section-card-body">
        <textarea class="textarea-chords" placeholder="Escribe acordes... Ej: C | G | Am | F" ${!isEditingUnlocked ? 'disabled' : ''}>${escapeHTML(sec.chords || '')}</textarea>
        <input type="text" class="input-section-notes" value="${escapeHTML(sec.notes || '')}" placeholder="Notas / indicaciones para músicos..." ${!isEditingUnlocked ? 'disabled' : ''} />
      </div>
    `;

    const nameInp = card.querySelector('.input-section-name');
    nameInp.addEventListener('change', (e) => {
      sec.name = e.target.value;
      saveSongsToStorage();
    });

    const colorInp = card.querySelector('.color-picker-custom');
    colorInp.addEventListener('change', (e) => {
      sec.color = e.target.value;
      card.style.borderLeft = `5px solid ${sec.color}`;
      saveSongsToStorage();
    });

    const chordsTextarea = card.querySelector('.textarea-chords');
    chordsTextarea.addEventListener('input', (e) => {
      sec.chords = e.target.value;
      saveSongsToStorage();
    });

    const notesInp = card.querySelector('.input-section-notes');
    notesInp.addEventListener('change', (e) => {
      sec.notes = e.target.value;
      saveSongsToStorage();
    });

    const btnDelete = card.querySelector('.btn-delete-sec');
    btnDelete.addEventListener('click', () => {
      if (confirm(`¿Eliminar la sección "${sec.name}"?`)) {
        if (song.structure) {
          song.structure = song.structure.filter(s => s.id !== sec.id);
        } else if (song.sections) {
          song.sections = song.sections.filter(s => s.id !== sec.id);
        }
        saveSongsToStorage();
        renderSections(song);
      }
    });

    container.appendChild(card);
  });
}

export function addSection() {
  const song = getCurrentSong();
  if (!song) return;

  if (!song.structure) song.structure = song.sections || [];

  const newSec = {
    id: 'sec-' + Date.now(),
    name: 'NUEVA SECCIÓN',
    color: '#03dac6',
    chords: 'C | G | Am | F',
    notes: ''
  };

  song.structure.push(newSec);
  saveSongsToStorage();
  renderSections(song);
}

export function toggleEditModeLock() {
  isEditingUnlocked = !isEditingUnlocked;
  updateEditLockUI();
  renderCurrentSong();
}

export function updateEditLockUI() {
  const btnLock = document.getElementById('btnToggleEditMode');
  const iconLock = document.getElementById('iconEditLock');
  const labelLock = document.getElementById('labelEditLock');

  if (isEditingUnlocked) {
    if (btnLock) btnLock.className = 'btn-toggle-edit-mode unlocked';
    if (iconLock) {
      iconLock.className = 'fa-solid fa-lock-open theme-icon';
    }
    if (labelLock) labelLock.textContent = 'Modo Edición (Habilitado)';
  } else {
    if (btnLock) btnLock.className = 'btn-toggle-edit-mode';
    if (iconLock) {
      iconLock.className = 'fa-solid fa-lock theme-icon';
    }
    if (labelLock) labelLock.textContent = 'Modo Lectura (Bloqueado)';
  }
}
