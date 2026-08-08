/**
 * ChordMap Pro - Harmonic Transposition Engine
 */

export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const DIATONIC_SCALES = {
  'C':   ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim', 'G7'],
  'C#':  ['C#', 'D#m', 'E#m', 'F#', 'G#', 'A#m', 'B#dim', 'G#7'],
  'D':   ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim', 'A7'],
  'Eb':  ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim', 'Bb7'],
  'E':   ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim', 'B7'],
  'F':   ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim', 'C7'],
  'F#':  ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim', 'C#7'],
  'G':   ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim', 'D7'],
  'Ab':  ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim', 'Eb7'],
  'A':   ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim', 'E7'],
  'Bb':  ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim', 'F7'],
  'B':   ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim', 'F#7'],
  
  'Cm':  ['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'G7'],
  'C#m': ['C#m', 'D#dim', 'E', 'F#m', 'G#m', 'A', 'B', 'G#7'],
  'Dm':  ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C', 'A7'],
  'Ebm': ['Ebm', 'Fdim', 'Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Bb7'],
  'Em':  ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D', 'B7'],
  'Fm':  ['Fm', 'Gdim', 'Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'C7'],
  'F#m': ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E', 'C#7'],
  'Gm':  ['Gm', 'Adim', 'Bb', 'Cm', 'Dm', 'Eb', 'F', 'D7'],
  'Abm': ['Abm', 'Bbdim', 'Cb', 'Dbm', 'Ebm', 'Fb', 'Gb', 'Eb7'],
  'Am':  ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G', 'E7'],
  'Bbm': ['Bbm', 'Cdim', 'Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'F7'],
  'Bm':  ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A', 'F7']
};

export function transposeChord(chordStr, semitones) {
  if (!chordStr || semitones === 0) return chordStr;

  return chordStr.replace(/([A-G][#b]?)([^/\s|]*)/g, (fullMatch, root, ext) => {
    let index = CHROMATIC_NOTES.indexOf(root);
    let useFlats = false;
    if (index === -1) {
      index = CHROMATIC_FLATS.indexOf(root);
      useFlats = true;
    }
    if (index === -1) return fullMatch;

    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    const newRoot = useFlats ? CHROMATIC_FLATS[newIndex] : CHROMATIC_NOTES[newIndex];
    return newRoot + ext;
  });
}

export function getSemitoneDifference(fromKey, toKey) {
  if (!fromKey || !toKey) return 0;
  const cleanFrom = fromKey.replace('m', '');
  const cleanTo = toKey.replace('m', '');

  let idxFrom = CHROMATIC_NOTES.indexOf(cleanFrom);
  if (idxFrom === -1) idxFrom = CHROMATIC_FLATS.indexOf(cleanFrom);

  let idxTo = CHROMATIC_NOTES.indexOf(cleanTo);
  if (idxTo === -1) idxTo = CHROMATIC_FLATS.indexOf(cleanTo);

  if (idxFrom === -1 || idxTo === -1) return 0;
  let diff = idxTo - idxFrom;
  if (diff > 6) diff -= 12;
  if (diff < -6) diff += 12;
  return diff;
}
