/**
 * ChordMap Pro - PDF Export Engine (html2pdf / Window Print)
 */

import { AppState, getCurrentSong } from '../core/state.js';

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPDFChordsHTML(chordsText) {
  if (!chordsText) return '';
  const lines = chordsText.split('\n');

  let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
  lines.forEach(line => {
    if (!line.trim()) return;
    html += '<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">';
    const measures = line.split('|');

    measures.forEach((measureStr, mIdx) => {
      const chords = measureStr.trim().split(/\s+/).filter(c => c.length > 0);
      html += '<div style="display: inline-flex; align-items: center; gap: 6px; border: 2px solid #1a1a24; border-radius: 8px; padding: 6px 10px; background: #f8f9fa;">';
      chords.forEach(chord => {
        html += `<span style="font-family: 'JetBrains Mono', monospace; font-size: 17px; font-weight: 800; color: #000; padding: 4px 8px; background: #e2e8f0; border-radius: 6px;">${escapeHTML(chord)}</span>`;
      });
      html += '</div>';

      if (mIdx < measures.length - 1) {
        html += '<div style="width: 3px; height: 30px; background: #000; margin: 0 4px; border-radius: 2px;"></div>';
      }
    });

    html += '</div>';
  });
  html += '</div>';
  return html;
}

function buildPDFHTML(song) {
  const logoHTML = AppState.bandLogoBase64 
    ? `<img src="${AppState.bandLogoBase64}" style="max-height: 55px; border-radius: 8px;" />` 
    : `<h2 style="margin: 0; color: #000; font-weight: 800;">CHORDMAP PRO</h2>`;

  let sectionsHTML = '';
  if (song.structure && song.structure.length > 0) {
    song.structure.forEach(sec => {
      sectionsHTML += `
        <div style="margin-bottom: 20px; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
            <span style="font-weight: 800; font-size: 18px; color: ${sec.color || '#000'}; text-transform: uppercase;">${escapeHTML(sec.name)}</span>
            ${sec.notes ? `<span style="font-size: 13px; color: #64748b; font-style: italic;">${escapeHTML(sec.notes)}</span>` : ''}
          </div>
          ${formatPDFChordsHTML(sec.chords)}
        </div>
      `;
    });
  }

  return `
    <div style="background: #ffffff; color: #000000; font-family: 'Inter', sans-serif; padding: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #000; padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <h1 style="font-size: 32px; font-weight: 800; margin: 0 0 4px 0; text-transform: uppercase; color: #000;">${escapeHTML(song.title)}</h1>
          <h3 style="font-size: 20px; font-weight: 600; margin: 0; color: #475569;">${escapeHTML(song.artist)}</h3>
        </div>
        <div style="text-align: right;">
          ${logoHTML}
          <div style="font-size: 14px; font-weight: 700; color: #64748b; margin-top: 6px;">
            TONO: ${escapeHTML(song.currentKey || song.originalKey)} | BPM: ${song.bpm} | AFINACIÓN: ${escapeHTML(song.tuning)}
          </div>
        </div>
      </div>
      <div>${sectionsHTML}</div>
    </div>
  `;
}

export function openPDFPrintWindow(htmlContent, title) {
  const printWin = window.open('', '_blank', 'width=950,height=900');
  if (!printWin) {
    alert('Permite la apertura de ventanas emergentes para exportar el PDF.');
    return;
  }

  const doc = printWin.document;
  doc.open();
  doc.write('<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>' + escapeHTML(title) + ' - PDF</title>');
  doc.write('<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet">');
  doc.write('<style>@page { size: A4 portrait; margin: 12mm; } * { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: "Inter", -apple-system, sans-serif; color: #000000; background: #ffffff; padding: 20px; } .no-print-bar { display: flex; align-items: center; justify-content: space-between; background: #12131c; color: #ffffff; padding: 14px 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); } .btn-print-now { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: #ffffff; font-weight: 800; border: none; padding: 12px 24px; border-radius: 10px; font-size: 15px; cursor: pointer; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4); } @media print { .no-print-bar { display: none !important; } body { padding: 0; } }</style>');
  doc.write('</head><body>');
  doc.write('<div class="no-print-bar"><div><strong>ChordMap Pro PDF Export Engine</strong> — Presiona el botón para guardar en PDF</div><button class="btn-print-now" onclick="window.print()">🖨️ Guardar como PDF / Imprimir</button></div>');
  doc.write(htmlContent);
  doc.write('</body></html>');
  doc.close();

  setTimeout(() => {
    try { printWin.print(); } catch (e) {}
  }, 450);
}

export function exportSingleSongPDF() {
  const song = getCurrentSong();
  if (!song) return;
  const html = buildPDFHTML(song);
  openPDFPrintWindow(html, `${song.title} - ChordMap Pro`);
}

export function exportSetlistPDF() {
  if (!AppState.songs.length) return;

  let html = `<h1 style="text-align: center; font-size: 26px; margin-bottom: 24px; font-weight: 800; text-transform: uppercase;">CANCIONERO REPERTORIO - CHORDMAP PRO</h1>`;
  AppState.songs.forEach((song, idx) => {
    html += buildPDFHTML(song);
    if (idx < AppState.songs.length - 1) {
      html += `<div style="page-break-after: always; height: 1px; margin: 24px 0;"></div>`;
    }
  });

  openPDFPrintWindow(html, `Cancionero Completo - ChordMap Pro`);
}
