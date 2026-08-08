/**
 * ChordMap Pro - Theme & Visual Esthetics Engine
 */

import { AppState } from './state.js';

export const THEME_SYMBOLS = {
  cosmic: ['🔮', '👁️', '✨', '⚡', '🌌', '📜'],
  satanic: ['🔥', '🩸', '⛧', '⚡', '💀', '🕯️'],
  slime: ['👻', '☣️', '🧪', '💀', '🧟', '👽'],
  vampire: ['🦇', '🩸', '🏰', '⚰️', '🍷', '🌙'],
  spooky: ['🎃', '🕷️', '🕸️', '🧹', '🔮', '🍬'],
  arcane: ['🪄', '📜', '🔮', '✨', '📖', '💎'],
  epic: ['🐉', '⚔️', '🛡️', '👑', '🔥', '💍'],
  steampunk: ['⚙️', '🧭', '🧪', '🗝️', '📜', '🎩'],
  galaxy: ['🌌', '🪐', '🚀', '✨', '🛸', '☄️'],
  astro: ['👨‍🚀', '🚀', '🛰️', '🌕', '⭐', '💥'],
  retro: ['👾', '🕹️', '🍄', '⭐', '⚔️', '💎'],
  synthwave: ['🤖', '🕶️', '🕹️', '🌴', '🌆', '⚡'],
  matrix: ['👾', '⌨️', '💻', '🟢', '🔓', '⚡'],
  cyber: ['⚡', '🌐', '🤖', '💾', '💎', '🛸'],
  studio: ['🎧', '🎙️', '🎵', '🎶', '🎛️', '🎷']
};

export const ICON_FALLBACKS = {
  logo: 'fa-guitar', repertoire: 'fa-music', create: 'fa-circle-plus', setlists: 'fa-layer-group',
  editor: 'fa-pen-to-square', live: 'fa-microphone-lines', export: 'fa-file-pdf', settings: 'fa-sliders',
  search: 'fa-magnifying-glass', backup: 'fa-database', menu: 'fa-bars', home: 'fa-house',
  lock: 'fa-lock', unlock: 'fa-lock-open', save: 'fa-floppy-disk', metro: 'fa-stopwatch',
  audio: 'fa-volume-high', power: 'fa-bolt', close: 'fa-xmark', exit: 'fa-door-open',
  previous: 'fa-arrow-left', next: 'fa-arrow-right', delete: 'fa-trash'
};

export const THEME_ICON_SETS = {
  cosmic:    { logo:'fa-eye', repertoire:'fa-meteor', create:'fa-wand-magic-sparkles', setlists:'fa-scroll', editor:'fa-feather-pointed', live:'fa-satellite-dish', export:'fa-file-lines', settings:'fa-atom', home:'fa-eye' },
  satanic:   { logo:'fa-skull', repertoire:'fa-fire-flame-curved', create:'fa-wand-magic-sparkles', setlists:'fa-book', editor:'fa-feather-pointed', live:'fa-fire', export:'fa-scroll', settings:'fa-skull', home:'fa-skull' },
  slime:     { logo:'fa-ghost', repertoire:'fa-ghost', create:'fa-flask', setlists:'fa-vial', editor:'fa-pen-ruler', live:'fa-radio', export:'fa-file-circle-check', settings:'fa-flask', home:'fa-ghost' },
  vampire:   { logo:'fa-moon', repertoire:'fa-wine-glass', create:'fa-droplet', setlists:'fa-book-open', editor:'fa-feather', live:'fa-moon', export:'fa-file-lines', settings:'fa-moon', home:'fa-moon' },
  spooky:    { logo:'fa-ghost', repertoire:'fa-ghost', create:'fa-wand-magic-sparkles', setlists:'fa-book-open', editor:'fa-feather-pointed', live:'fa-microphone-lines', export:'fa-scroll', settings:'fa-ghost', home:'fa-ghost' },
  arcane:    { logo:'fa-wand-magic-sparkles', repertoire:'fa-hat-wizard', create:'fa-wand-magic-sparkles', setlists:'fa-book-open', editor:'fa-feather-pointed', live:'fa-wand-magic-sparkles', export:'fa-scroll', settings:'fa-dice-d20', home:'fa-hat-wizard' },
  epic:      { logo:'fa-dragon', repertoire:'fa-shield-halved', create:'fa-sword', setlists:'fa-crown', editor:'fa-feather-pointed', live:'fa-dragon', export:'fa-scroll', settings:'fa-gear', home:'fa-crown' },
  steampunk: { logo:'fa-gear', repertoire:'fa-gear', create:'fa-screwdriver-wrench', setlists:'fa-compass', editor:'fa-pen-ruler', live:'fa-tower-broadcast', export:'fa-file-zipper', settings:'fa-gears', home:'fa-gear' },
  galaxy:    { logo:'fa-globe', repertoire:'fa-star', create:'fa-rocket', setlists:'fa-satellite', editor:'fa-pen-fancy', live:'fa-satellite-dish', export:'fa-file-lines', settings:'fa-atom', home:'fa-globe' },
  astro:     { logo:'fa-rocket', repertoire:'fa-satellite', create:'fa-rocket', setlists:'fa-map-location-dot', editor:'fa-pen-ruler', live:'fa-tower-broadcast', export:'fa-file-lines', settings:'fa-satellite', home:'fa-rocket' },
  retro:     { logo:'fa-gamepad', repertoire:'fa-gamepad', create:'fa-plus', setlists:'fa-trophy', editor:'fa-keyboard', live:'fa-gamepad', export:'fa-floppy-disk', settings:'fa-sliders', home:'fa-gamepad' },
  synthwave: { logo:'fa-robot', repertoire:'fa-compact-disc', create:'fa-bolt', setlists:'fa-list-ol', editor:'fa-keyboard', live:'fa-headphones', export:'fa-file-audio', settings:'fa-sliders', home:'fa-robot' },
  matrix:    { logo:'fa-terminal', repertoire:'fa-code', create:'fa-plus', setlists:'fa-list-ol', editor:'fa-terminal', live:'fa-tower-broadcast', export:'fa-file-code', settings:'fa-microchip', home:'fa-terminal' },
  cyber:     { logo:'fa-microchip', repertoire:'fa-wave-square', create:'fa-bolt', setlists:'fa-network-wired', editor:'fa-code', live:'fa-headset', export:'fa-file-code', settings:'fa-microchip', home:'fa-microchip' },
  studio:    { logo:'fa-headphones', repertoire:'fa-music', create:'fa-circle-plus', setlists:'fa-list-ol', editor:'fa-sliders', live:'fa-microphone-lines', export:'fa-file-audio', settings:'fa-sliders', home:'fa-headphones' }
};

export function themeIcon(role) {
  const set = THEME_ICON_SETS[AppState.theme] || THEME_ICON_SETS.cosmic;
  return set[role] || ICON_FALLBACKS[role] || 'fa-circle';
}

export function applyThemeIcons() {
  document.querySelectorAll('[data-theme-icon]').forEach(icon => {
    const role = icon.dataset.themeIcon;
    const nextClass = themeIcon(role);
    Array.from(icon.classList).filter(className => className.startsWith('fa-') && className !== 'fa-solid').forEach(className => icon.classList.remove(className));
    icon.classList.add('fa-solid', 'theme-icon', nextClass);
  });
}

export function applyTheme(themeName) {
  const nextTheme = themeName || 'cosmic';
  const shouldAnimate = AppState.theme && AppState.theme !== nextTheme;
  AppState.theme = nextTheme;
  document.body.dataset.theme = AppState.theme;
  localStorage.setItem('chordmap_theme', AppState.theme);

  if (shouldAnimate) {
    document.body.classList.remove('theme-changing');
    void document.body.offsetWidth;
    document.body.classList.add('theme-changing');
    window.setTimeout(() => document.body.classList.remove('theme-changing'), 750);
  }

  const sel = document.getElementById('themeSelect');
  if (sel) sel.value = AppState.theme;

  const symbols = THEME_SYMBOLS[AppState.theme] || THEME_SYMBOLS.cosmic;
  const floatItems = document.querySelectorAll('.cosmic-float-item');
  floatItems.forEach((item, idx) => {
    item.textContent = symbols[idx % symbols.length];
  });
  applyThemeIcons();
}
