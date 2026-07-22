// Core schema for a single eye's physical state at any instant.
// Every pathology is expressed as modifiers on top of this neutral shape —
// nothing hand-animates a specific condition; the engine computes it.

export type Side = 'L' | 'R';

export interface EyeState {
  pupilDiameter: number;   // mm, ~2 (constricted) to ~7 (dilated)
  gazeX: number;           // degrees, negative = looking toward patient's left, positive = right
  gazeY: number;           // degrees, negative = up, positive = down
  lidPosition: number;     // 0 = closed, 1 = normal open, 1.2 = lid retraction
}

export interface EyePairState {
  left: EyeState;
  right: EyeState;
}

export const NEUTRAL_EYE: EyeState = {
  pupilDiameter: 4,
  gazeX: 0,
  gazeY: 0,
  lidPosition: 1,
};

export function neutralPair(): EyePairState {
  return { left: { ...NEUTRAL_EYE }, right: { ...NEUTRAL_EYE } };
}

// Pupil light-reflex constants
export const PUPIL_LIT = 2.2;
export const PUPIL_MID = 4.0;
export const PUPIL_DIM = 6.0;

export type LightSide = 'left' | 'right' | 'off';
