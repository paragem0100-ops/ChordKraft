/**
 * ChordMap Pro - Setlist & Show Management Service
 */

import { AppState, saveSetlistsToStorage } from '../core/state.js';

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderSetlistSelect() {
  const select = document.getElementById('setlistSelect');
  if (!select) return;
  select.innerHTML = '';

  AppState.setlists.forEach(st => {
    const opt = document.createElement('option');
    opt.value = st.id;
    opt.textContent = st.name;
    if (st.id === AppState.activeSetlistId) opt.selected = true;
    select.appendChild(opt);
  });

  const createOpt = document.createElement('option');
  createOpt.value = '__new__';
  createOpt.textContent = '➕ Armar Nuevo Show...';
  select.appendChild(createOpt);
}

export function openSetlistBuilderModal(setlistId = null, onUpdateCallback = null) {
  const modal = document.getElementById('modalSetlistBuilder');
  const titleInput = document.getElementById('setlistTitleInput');
  const checklist = document.getElementById('setlistSongsChecklist');
  const btnDelete = document.getElementById('btnDeleteCurrentSetlist');
  if (!modal) return;

  let currentSetlist = AppState.setlists.find(s => s.id === setlistId);
  if (!currentSetlist && setlistId !== '__new__') {
    currentSetlist = AppState.setlists.find(s => s.id === AppState.activeSetlistId);
  }

  if (currentSetlist && currentSetlist.id !== 'all-songs') {
    titleInput.value = currentSetlist.name;
    if (btnDelete) btnDelete.style.display = 'block';
    modal.dataset.editingId = currentSetlist.id;
  } else {
    titleInput.value = 'Show En Vivo ' + (AppState.setlists.length);
    if (btnDelete) btnDelete.style.display = 'none';
    modal.dataset.editingId = '__new__';
  }

  checklist.innerHTML = '';
  const selectedSongIds = (currentSetlist && currentSetlist.id !== 'all-songs') ? (currentSetlist.songIds || []) : AppState.songs.map(s => s.id);

  AppState.songs.forEach(song => {
    const isChecked = selectedSongIds.includes(song.id);
    const item = document.createElement('label');
    item.className = 'setlist-check-item';
    item.innerHTML = `
      <input type="checkbox" value="${song.id}" ${isChecked ? 'checked' : ''} />
      <div class="setlist-check-info">
        <h5>${escapeHTML(song.title)}</h5>
        <p>${escapeHTML(song.artist)} • Tono: ${song.currentKey || song.originalKey || 'C'}</p>
      </div>
    `;
    checklist.appendChild(item);
  });

  modal.classList.add('active');
}

export function closeSetlistBuilderModal() {
  const modal = document.getElementById('modalSetlistBuilder');
  if (modal) modal.classList.remove('active');
}

export function saveCurrentSetlistFromModal(renderSongListCallback) {
  const modal = document.getElementById('modalSetlistBuilder');
  const titleInput = document.getElementById('setlistTitleInput');
  const checklist = document.getElementById('setlistSongsChecklist');
  if (!modal || !titleInput || !checklist) return;

  const title = titleInput.value.trim() || 'Nuevo Show';
  const checkedSongIds = Array.from(checklist.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

  const editingId = modal.dataset.editingId;

  if (editingId && editingId !== '__new__' && editingId !== 'all-songs') {
    const existing = AppState.setlists.find(s => s.id === editingId);
    if (existing) {
      existing.name = title;
      existing.songIds = checkedSongIds;
    }
  } else {
    const newSetlist = {
      id: 'show-' + Date.now(),
      name: title,
      songIds: checkedSongIds
    };
    AppState.setlists.push(newSetlist);
    AppState.activeSetlistId = newSetlist.id;
  }

  saveSetlistsToStorage();
  renderSetlistSelect();
  if (renderSongListCallback) renderSongListCallback();
  closeSetlistBuilderModal();
}

export function deleteCurrentSetlistFromModal(renderSongListCallback) {
  const modal = document.getElementById('modalSetlistBuilder');
  if (!modal) return;
  const editingId = modal.dataset.editingId;

  if (!editingId || editingId === 'all-songs' || editingId === '__new__') return;

  if (confirm('¿Eliminar este Show de la lista de presentaciones?')) {
    AppState.setlists = AppState.setlists.filter(s => s.id !== editingId);
    AppState.activeSetlistId = 'all-songs';
    saveSetlistsToStorage();
    renderSetlistSelect();
    if (renderSongListCallback) renderSongListCallback();
    closeSetlistBuilderModal();
  }
}
