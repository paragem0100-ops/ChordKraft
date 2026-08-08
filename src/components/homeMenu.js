/**
 * ChordMap Pro - CHORDKRAFT Main Menu Component
 */

import { AppState, getCurrentSong } from '../core/state.js';
import { openSetlistBuilderModal } from '../services/setlists.js';
import { exportSetlistPDF } from '../services/pdfExporter.js';

export function renderHomePanel() {
  const statusText = document.getElementById('homeStatusText');
  if (statusText) {
    const activeSetlist = AppState.setlists.find(s => s.id === AppState.activeSetlistId) || AppState.setlists[0];
    const setlistName = activeSetlist ? activeSetlist.name : 'Repertorio General';
    const songCount = activeSetlist ? (activeSetlist.songIds ? activeSetlist.songIds.length : AppState.songs.length) : AppState.songs.length;
    statusText.textContent = `• Último Show: "${setlistName}" (${songCount} temas)`;
  }
}

export function openHome() {
  renderHomePanel();
  const overlay = document.getElementById('homeOverlay');
  if (overlay) overlay.classList.add('active');
}

export function closeHome() {
  const overlay = document.getElementById('homeOverlay');
  if (overlay) overlay.classList.remove('active');
}

export function invokeRandomSong(renderSongListCallback, renderCurrentSongCallback, showToastCallback) {
  if (!AppState.songs || AppState.songs.length === 0) {
    if (showToastCallback) showToastCallback('No hay canciones guardadas en la lista', 'warning', '⚠️');
    return;
  }
  const randomIndex = Math.floor(Math.random() * AppState.songs.length);
  const randomSong = AppState.songs[randomIndex];
  AppState.currentSongId = randomSong.id;
  
  if (renderSongListCallback) renderSongListCallback();
  if (renderCurrentSongCallback) renderCurrentSongCallback();
  closeHome();
  if (showToastCallback) showToastCallback(`🎲 Invocada: "${randomSong.title}"`, 'success', '🎲');
}

export function handleHomeAction(action, callbacks = {}) {
  if (action === 'repertoire') {
    closeHome();
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768 && sidebar) sidebar.classList.add('open');
    window.setTimeout(() => {
      const input = document.getElementById('searchInput');
      if (input) input.focus();
    }, 250);
    return;
  }
  if (action === 'new-song') {
    closeHome();
    if (callbacks.createNewSong) callbacks.createNewSong();
    window.setTimeout(() => {
      const input = document.getElementById('songTitleInput');
      if (input) input.focus();
    }, 250);
    return;
  }
  if (action === 'setlists') {
    closeHome();
    openSetlistBuilderModal(AppState.activeSetlistId);
    return;
  }
  if (action === 'editor') {
    closeHome();
    const canvas = document.querySelector('.main-canvas');
    if (canvas) canvas.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  if (action === 'live') {
    closeHome();
    if (!AppState.isLiveMode && callbacks.toggleLiveMode) callbacks.toggleLiveMode();
    return;
  }
  if (action === 'export') {
    closeHome();
    exportSetlistPDF();
  }
}
