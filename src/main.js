/**
 * ChordMap Pro - Main Orchestrator ES Module Entry Point
 */

import { AppState, loadDataFromStorage, saveSongsToStorage, saveSetlistsToStorage, getCurrentSong } from './core/state.js';
import { applyTheme, applyThemeIcons } from './core/theme.js';
import { transposeChord, getSemitoneDifference } from './services/transposer.js';
import { exportSingleSongPDF, exportSetlistPDF } from './services/pdfExporter.js';
import { renderSetlistSelect, openSetlistBuilderModal, closeSetlistBuilderModal, saveCurrentSetlistFromModal, deleteCurrentSetlistFromModal } from './services/setlists.js';
import { openHome, closeHome, renderHomePanel, handleHomeAction, invokeRandomSong } from './components/homeMenu.js';
import { renderSongList, renderCurrentSong, createNewSong, selectSong, toggleEditModeLock, addSection } from './components/songEditor.js';
import { toggleLiveMode, renderLiveModeContent, navigateLiveSong } from './components/liveMode.js';

function showToast(message, type = 'info', icon = '🔮') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function boot() {
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let reg of registrations) {
          reg.unregister();
        }
      });
    }
    if (window.caches) {
      caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
    }
  } catch (err) {}

  try {
    loadDataFromStorage();
  } catch (err) {}

  try {
    initEventListeners();
  } catch (err) {}

  try {
    applyTheme(AppState.theme || 'cosmic');
  } catch (err) {}

  try {
    renderSetlistSelect();
    renderSongList();
    renderCurrentSong();
  } catch (err) {}

  window.openHome = openHome;
  window.closeHome = closeHome;
  window.toggleLiveMode = toggleLiveMode;
  window.createNewSong = createNewSong;
  window.selectSong = selectSong;
  window.exportSingleSongPDF = exportSingleSongPDF;
  window.exportSetlistPDF = exportSetlistPDF;

  try {
    openHome();
  } catch (err) {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

function initEventListeners() {
  const btnOpenHome = document.getElementById('btnOpenHome');
  if (btnOpenHome) btnOpenHome.addEventListener('click', openHome);
  
  const btnCloseHome = document.getElementById('btnCloseHome');
  if (btnCloseHome) btnCloseHome.addEventListener('click', closeHome);

  document.querySelectorAll('[data-home-action]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const action = button.dataset.homeAction;
      handleHomeAction(action, {
        createNewSong,
        toggleLiveMode,
        showToast
      });
    });
  });

  const btnRandomSong = document.getElementById('btnRandomSong');
  if (btnRandomSong) {
    btnRandomSong.addEventListener('click', (e) => {
      e.preventDefault();
      invokeRandomSong(renderSongList, renderCurrentSong, showToast);
    });
  }

  const btnHomeSettings = document.getElementById('btnHomeSettings');
  if (btnHomeSettings) {
    btnHomeSettings.addEventListener('click', (e) => {
      e.preventDefault();
      const themeSelect = document.getElementById('themeSelect');
      if (themeSelect) {
        themeSelect.focus();
        if (themeSelect.showPicker) {
          try { themeSelect.showPicker(); } catch (err) {}
        }
      }
      showToast('⚙️ Ajustá la estética desde la barra superior', 'info', '⚙️');
    });
  }

  const homeOverlay = document.getElementById('homeOverlay');
  if (homeOverlay) {
    homeOverlay.addEventListener('click', (event) => {
      if (event.target === homeOverlay) closeHome();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && homeOverlay && homeOverlay.classList.contains('active')) closeHome();
  });

  const btnNewSong = document.getElementById('btnNewSong');
  if (btnNewSong) {
    btnNewSong.addEventListener('click', () => {
      createNewSong();
      showToast('✨ Nueva canción creada', 'success', '🎵');
    });
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSongList(e.target.value);
    });
  }

  const setlistSelect = document.getElementById('setlistSelect');
  if (setlistSelect) {
    setlistSelect.addEventListener('change', (e) => {
      if (e.target.value === '__new__') {
        openSetlistBuilderModal('__new__');
        setlistSelect.value = AppState.activeSetlistId;
      } else {
        AppState.activeSetlistId = e.target.value;
        renderSongList();
      }
    });
  }

  const btnManageSetlists = document.getElementById('btnManageSetlists');
  if (btnManageSetlists) {
    btnManageSetlists.addEventListener('click', () => {
      openSetlistBuilderModal(AppState.activeSetlistId);
    });
  }

  const btnSaveSetlistModal = document.getElementById('btnSaveSetlistModal');
  if (btnSaveSetlistModal) {
    btnSaveSetlistModal.addEventListener('click', () => {
      saveCurrentSetlistFromModal(renderSongList);
      showToast('✨ Show guardado con éxito', 'success', '📜');
    });
  }

  const btnCloseSetlistModal = document.getElementById('btnCloseSetlistModal');
  if (btnCloseSetlistModal) {
    btnCloseSetlistModal.addEventListener('click', closeSetlistBuilderModal);
  }

  const btnDeleteSetlist = document.getElementById('btnDeleteCurrentSetlist');
  if (btnDeleteSetlist) {
    btnDeleteSetlist.addEventListener('click', () => {
      deleteCurrentSetlistFromModal(renderSongList);
    });
  }

  const songTitleInput = document.getElementById('songTitleInput');
  if (songTitleInput) {
    songTitleInput.addEventListener('change', (e) => {
      const song = getCurrentSong();
      if (song) {
        song.title = e.target.value;
        saveSongsToStorage();
        renderSongList();
      }
    });
  }

  const songArtistInput = document.getElementById('songArtistInput');
  if (songArtistInput) {
    songArtistInput.addEventListener('change', (e) => {
      const song = getCurrentSong();
      if (song) {
        song.artist = e.target.value;
        saveSongsToStorage();
        renderSongList();
      }
    });
  }

  const keySelect = document.getElementById('keySelect');
  if (keySelect) {
    keySelect.addEventListener('change', (e) => {
      const song = getCurrentSong();
      if (!song) return;

      const oldKey = song.currentKey || song.originalKey || 'C';
      const newKey = e.target.value;
      const semitones = getSemitoneDifference(oldKey, newKey);

      song.currentKey = newKey;

      if (semitones !== 0) {
        const structure = song.structure || song.sections || [];
        structure.forEach(sec => {
          sec.chords = transposeChord(sec.chords, semitones);
        });
        showToast(`🎶 Transpuesto ${semitones > 0 ? '+' : ''}${semitones} semitonos a ${newKey}`, 'info', '🎸');
      }

      saveSongsToStorage();
      renderSongList();
      renderCurrentSong();
    });
  }

  const tuningSelect = document.getElementById('tuningSelect');
  if (tuningSelect) {
    tuningSelect.addEventListener('change', (e) => {
      const song = getCurrentSong();
      if (song) {
        song.tuning = e.target.value;
        saveSongsToStorage();
      }
    });
  }

  const bpmInput = document.getElementById('bpmInput');
  if (bpmInput) {
    bpmInput.addEventListener('change', (e) => {
      const song = getCurrentSong();
      if (song) {
        song.bpm = parseInt(e.target.value, 10) || 120;
        saveSongsToStorage();
      }
    });
  }

  const btnToggleEditMode = document.getElementById('btnToggleEditMode');
  if (btnToggleEditMode) {
    btnToggleEditMode.addEventListener('click', toggleEditModeLock);
  }

  const btnSaveSong = document.getElementById('btnSaveSong');
  if (btnSaveSong) {
    btnSaveSong.addEventListener('click', () => {
      saveSongsToStorage();
      showToast('Confirmado y guardado', 'success', '💾');
    });
  }

  const btnAddSection = document.getElementById('btnAddSection');
  if (btnAddSection) {
    btnAddSection.addEventListener('click', addSection);
  }

  const btnToggleLiveMode = document.getElementById('btnToggleLiveMode');
  if (btnToggleLiveMode) {
    btnToggleLiveMode.addEventListener('click', () => toggleLiveMode());
  }

  const btnExitLiveMode = document.getElementById('btnExitLiveMode');
  if (btnExitLiveMode) {
    btnExitLiveMode.addEventListener('click', () => toggleLiveMode(true));
  }

  const btnLivePrev = document.getElementById('btnLivePrev');
  if (btnLivePrev) {
    btnLivePrev.addEventListener('click', () => navigateLiveSong(-1));
  }

  const btnLiveNext = document.getElementById('btnLiveNext');
  if (btnLiveNext) {
    btnLiveNext.addEventListener('click', () => navigateLiveSong(1));
  }

  const btnExportSongPdf = document.getElementById('btnExportSongPdf');
  if (btnExportSongPdf) btnExportSongPdf.addEventListener('click', exportSingleSongPDF);

  const btnExportSetlistPdf = document.getElementById('btnExportSetlistPdf');
  if (btnExportSetlistPdf) btnExportSetlistPdf.addEventListener('click', exportSetlistPDF);

  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
  }
}

export { AppState, showToast };
