import type { EyePairState, EyeState, LightSide } from './eyeState';
import { NEUTRAL_EYE, PUPIL_LIT, PUPIL_MID, PUPIL_DIM } from './eyeState';

import type { NystagmusType } from './nystagmus';
import { nystagmusOffset } from './nystagmus';

export type Category = 'pupil' | 'gaze' | 'nystagmus' | 'lid';

export interface PathologyModifier {
  // Pupil
  rapdSide?: Side_;               // afferent defect: this eye paradoxically dilates to light
  argyllRobertson?: boolean;       // reacts to accommodation, not light — approximate as sluggish/fixed
  tonicPupil?: Side_;              // slow, large pupil, poor light reaction

  // Gaze restriction: which eye can't move in which direction, in degrees of limitation (0-1)
  restrict?: {
    eye: Side_;
    direction: 'abduct' | 'adduct' | 'elevate' | 'depress';
    severity: number; // 0 = no limitation, 1 = complete
  }[];
  skewOffset?: { left: number; right: number }; // vertical misalignment, degrees
  inoSide?: Side_;                 // adduction lag + contralateral abducting nystagmus

  // Lids
  ptosis?: { left?: number; right?: number }; // 0-1, subtracted from lid position
  fatigable?: boolean;             // ptosis worsens over sustained gaze (myasthenia pattern)
  lidRetraction?: { left?: number; right?: number };

  // Nystagmus
  nystagmus?: { type: NystagmusType; eye?: Side_ | 'both'; amplitude?: number; freq?: number };
}

type Side_ = 'L' | 'R';

export interface Pathology {
  id: string;
  name: string;
  category: Category;
  modifiers: PathologyModifier;
}

// --- Preset library ---------------------------------------------------

export const PATHOLOGIES: Pathology[] = [
  // Pupillary
  { id: 'normal', name: 'Normal', category: 'pupil', modifiers: {} },
  { id: 'rapd-left', name: 'Left RAPD (Marcus Gunn)', category: 'pupil', modifiers: { rapdSide: 'L' } },
  { id: 'adie', name: "Adie's tonic pupil (right)", category: 'pupil', modifiers: { tonicPupil: 'R' } },
  { id: 'argyll-robertson', name: 'Argyll Robertson pupils', category: 'pupil', modifiers: { argyllRobertson: true } },
  { id: 'horner-right', name: 'Horner syndrome (right)', category: 'pupil', modifiers: { ptosis: { right: 0.3 }, tonicPupil: undefined } },
  { id: 'cn3-pupil-involving', name: 'CN III palsy, pupil-involving (right)', category: 'gaze', modifiers: {
    restrict: [
      { eye: 'R', direction: 'adduct', severity: 1 },
      { eye: 'R', direction: 'elevate', severity: 1 },
      { eye: 'R', direction: 'depress', severity: 0.6 },
    ],
    ptosis: { right: 0.9 },
  }},
  { id: 'cn3-pupil-sparing', name: 'CN III palsy, pupil-sparing (right)', category: 'gaze', modifiers: {
    restrict: [
      { eye: 'R', direction: 'adduct', severity: 1 },
      { eye: 'R', direction: 'elevate', severity: 1 },
    ],
    ptosis: { right: 0.9 },
  }},

  // Gaze / motility
  { id: 'cn4-palsy', name: 'CN IV palsy (right)', category: 'gaze', modifiers: {
    restrict: [{ eye: 'R', direction: 'depress', severity: 0.5 }],
    skewOffset: { left: 0, right: -4 },
  }},
  { id: 'cn6-palsy', name: 'CN VI palsy (right)', category: 'gaze', modifiers: {
    restrict: [{ eye: 'R', direction: 'abduct', severity: 1 }],
  }},
  { id: 'ino-left', name: 'Left INO', category: 'gaze', modifiers: { inoSide: 'L' } },
  { id: 'webino', name: 'Bilateral INO (WEBINO)', category: 'gaze', modifiers: {
    restrict: [
      { eye: 'L', direction: 'adduct', severity: 0.8 },
      { eye: 'R', direction: 'adduct', severity: 0.8 },
    ],
  }},
  { id: 'one-and-half', name: 'One-and-a-half syndrome (right)', category: 'gaze', modifiers: {
    restrict: [
      { eye: 'R', direction: 'abduct', severity: 1 },
      { eye: 'R', direction: 'adduct', severity: 1 },
      { eye: 'L', direction: 'adduct', severity: 1 },
    ],
  }},
  { id: 'psp', name: 'Progressive supranuclear palsy (vertical gaze palsy)', category: 'gaze', modifiers: {
    restrict: [
      { eye: 'L', direction: 'elevate', severity: 1 },
      { eye: 'R', direction: 'elevate', severity: 1 },
      { eye: 'L', direction: 'depress', severity: 0.8 },
      { eye: 'R', direction: 'depress', severity: 0.8 },
    ],
  }},
  { id: 'parinaud', name: 'Parinaud syndrome (dorsal midbrain)', category: 'gaze', modifiers: {
    restrict: [
      { eye: 'L', direction: 'elevate', severity: 1 },
      { eye: 'R', direction: 'elevate', severity: 1 },
    ],
    nystagmus: { type: 'convergence-retraction', eye: 'both', amplitude: 6, freq: 1 },
  }},
  { id: 'skew-deviation', name: 'Skew deviation', category: 'gaze', modifiers: {
    skewOffset: { left: 0, right: -6 },
  }},
  { id: 'cpeo', name: 'Chronic progressive external ophthalmoplegia', category: 'gaze', modifiers: {
    restrict: [
      { eye: 'L', direction: 'elevate', severity: 0.7 },
      { eye: 'R', direction: 'elevate', severity: 0.7 },
      { eye: 'L', direction: 'abduct', severity: 0.5 },
      { eye: 'R', direction: 'abduct', severity: 0.5 },
    ],
    ptosis: { left: 0.6, right: 0.6 },
  }},
  { id: 'duane', name: 'Duane retraction syndrome (right)', category: 'gaze', modifiers: {
    restrict: [{ eye: 'R', direction: 'abduct', severity: 0.9 }],
  }},

  // Neuromuscular
  { id: 'myasthenia', name: 'Ocular myasthenia gravis', category: 'lid', modifiers: {
    ptosis: { left: 0.3, right: 0.4 },
    fatigable: true,
  }},

  // Nystagmus / oscillations
  { id: 'downbeat', name: 'Downbeat nystagmus', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'downbeat', eye: 'both', amplitude: 8, freq: 1.5 },
  }},
  { id: 'upbeat', name: 'Upbeat nystagmus', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'upbeat', eye: 'both', amplitude: 8, freq: 1.5 },
  }},
  { id: 'pan', name: 'Periodic alternating nystagmus', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'periodic-alternating', eye: 'both', amplitude: 10, freq: 1.2 },
  }},
  { id: 'see-saw', name: 'See-saw nystagmus', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'see-saw', eye: 'both', amplitude: 8, freq: 0.8 },
  }},
  { id: 'gaze-evoked', name: 'Gaze-evoked nystagmus', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'gaze-evoked', eye: 'both', amplitude: 6, freq: 2 },
  }},
  { id: 'vestibular-peripheral', name: 'Vestibular nystagmus, peripheral', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'vestibular-peripheral', eye: 'both', amplitude: 9, freq: 2.5 },
  }},
  { id: 'vestibular-central', name: 'Vestibular nystagmus, central', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'vestibular-central', eye: 'both', amplitude: 7, freq: 1.8 },
  }},
  { id: 'flutter', name: 'Ocular flutter', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'flutter', eye: 'both', amplitude: 6, freq: 1 },
  }},
  { id: 'opsoclonus', name: 'Opsoclonus', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'opsoclonus', eye: 'both', amplitude: 8, freq: 1 },
  }},
  { id: 'square-wave', name: 'Square wave jerks', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'square-wave-jerks', eye: 'both', amplitude: 5, freq: 1 },
  }},
  { id: 'ocular-bobbing', name: 'Ocular bobbing', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'ocular-bobbing', eye: 'both', amplitude: 14, freq: 1 },
  }},
  { id: 'ocular-dipping', name: 'Ocular dipping', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'ocular-dipping', eye: 'both', amplitude: 14, freq: 1 },
  }},
  { id: 'som', name: 'Superior oblique myokymia (right)', category: 'nystagmus', modifiers: {
    nystagmus: { type: 'superior-oblique-myokymia', eye: 'R', amplitude: 1, freq: 1 },
  }},
];

// --- Engine -------------------------------------------------------------

function applyRestriction(base: EyeState, mods: PathologyModifier, eye: Side_): EyeState {
  const state = { ...base };
  if (!mods.restrict) return state;
  for (const r of mods.restrict) {
    if (r.eye !== eye) continue;
    if (r.direction === 'abduct' && state.gazeX > 0) state.gazeX *= 1 - r.severity;
    if (r.direction === 'adduct' && state.gazeX < 0) state.gazeX *= 1 - r.severity;
    if (r.direction === 'elevate' && state.gazeY < 0) state.gazeY *= 1 - r.severity;
    if (r.direction === 'depress' && state.gazeY > 0) state.gazeY *= 1 - r.severity;
  }
  return state;
}

export function computeEyeState(
  pathologyId: string,
  t: number,
  lightSide: LightSide,
  targetGazeX = 0,
  targetGazeY = 0
): EyePairState {
  const patho = PATHOLOGIES.find((p) => p.id === pathologyId) ?? PATHOLOGIES[0];
  const mods = patho.modifiers;

  let left: EyeState = { ...NEUTRAL_EYE, gazeX: targetGazeX, gazeY: targetGazeY };
  let right: EyeState = { ...NEUTRAL_EYE, gazeX: targetGazeX, gazeY: targetGazeY };

  // Pupils — light reflex baseline
  const lit = PUPIL_LIT, mid = PUPIL_MID, dim = PUPIL_DIM;
  if (mods.rapdSide) {
    const affected = mods.rapdSide;
    if (lightSide === 'off') {
      left.pupilDiameter = mid; right.pupilDiameter = mid;
    } else {
      const litThisEye = (lightSide === 'left' && affected !== 'L') || (lightSide === 'right' && affected !== 'R');
      const val = litThisEye ? lit : dim;
      left.pupilDiameter = val; right.pupilDiameter = val;
    }
  } else if (mods.tonicPupil || mods.argyllRobertson) {
    const affectedSide = mods.tonicPupil;
    left.pupilDiameter = affectedSide === 'L' ? mid + 1 : lightSide === 'off' ? mid : lit;
    right.pupilDiameter = affectedSide === 'R' ? mid + 1 : lightSide === 'off' ? mid : lit;
  } else {
    const val = lightSide === 'off' ? mid : lit;
    left.pupilDiameter = val; right.pupilDiameter = val;
  }

  // Gaze restriction
  left = applyRestriction(left, mods, 'L');
  right = applyRestriction(right, mods, 'R');

  // Skew deviation
  if (mods.skewOffset) {
    left.gazeY += mods.skewOffset.left;
    right.gazeY += mods.skewOffset.right;
  }

  // INO: adducting eye lags/undershoots, abducting eye gets nystagmus
  if (mods.inoSide) {
    const affected = mods.inoSide;
    const phase = Math.sin(t * 4);
    if (affected === 'L') {
      left.gazeX = Math.max(0, Math.min(phase, 0.3)) * 10;
      right.gazeX += phase * 8;
    } else {
      right.gazeX = Math.min(0, Math.max(phase, -0.3)) * 10;
      left.gazeX += phase * 8;
    }
  }

  // Lids
  if (mods.ptosis) {
    const fatigue = mods.fatigable ? Math.min(0.4, t * 0.01) : 0;
    if (mods.ptosis.left !== undefined) left.lidPosition = 1 - mods.ptosis.left - fatigue;
    if (mods.ptosis.right !== undefined) right.lidPosition = 1 - mods.ptosis.right - fatigue;
  }
  if (mods.lidRetraction) {
    if (mods.lidRetraction.left !== undefined) left.lidPosition = 1 + mods.lidRetraction.left;
    if (mods.lidRetraction.right !== undefined) right.lidPosition = 1 + mods.lidRetraction.right;
  }

  // Nystagmus
  if (mods.nystagmus) {
    const { type, eye, amplitude, freq } = mods.nystagmus;
    const offset = nystagmusOffset(type, t, amplitude, freq);
    if (eye === 'L') {
      left.gazeX += offset.x; left.gazeY += offset.y;
    } else if (eye === 'R') {
      right.gazeX += offset.x; right.gazeY += offset.y;
      if (type === 'superior-oblique-myokymia') { /* unilateral by design */ }
    } else {
      left.gazeX += offset.x; left.gazeY += offset.y;
      if (type === 'see-saw') {
        right.gazeX -= offset.x; right.gazeY -= offset.y;
      } else {
        right.gazeX += offset.x; right.gazeY += offset.y;
      }
    }
  }

  return { left, right };
}
