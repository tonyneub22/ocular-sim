// Each function returns a {x, y} degree offset to add to an eye's base gaze
// position at time t (seconds). Amplitude/frequency are tunable per preset.

export type NystagmusType =
  | 'none'
  | 'downbeat'
  | 'upbeat'
  | 'pendular'
  | 'jerk-horizontal'
  | 'gaze-evoked'
  | 'vestibular-peripheral'
  | 'vestibular-central'
  | 'periodic-alternating'
  | 'see-saw'
  | 'flutter'
  | 'opsoclonus'
  | 'square-wave-jerks'
  | 'ocular-bobbing'
  | 'ocular-dipping'
  | 'superior-oblique-myokymia'
  | 'convergence-retraction';

// Sawtooth: slow drift one way, fast reset — the classic "jerk" waveform.
function sawtooth(t: number, freq: number, amplitude: number) {
  const cycle = (t * freq) % 1;
  // slow phase 75% of cycle, fast phase 25%
  return cycle < 0.75 ? (cycle / 0.75) * amplitude : (1 - (cycle - 0.75) / 0.25) * amplitude;
}

export function nystagmusOffset(
  type: NystagmusType,
  t: number,
  amplitude = 6,
  freq = 2
): { x: number; y: number } {
  switch (type) {
    case 'downbeat':
      return { x: 0, y: -sawtooth(t, freq, amplitude) };
    case 'upbeat':
      return { x: 0, y: sawtooth(t, freq, amplitude) };
    case 'jerk-horizontal':
    case 'gaze-evoked':
      return { x: sawtooth(t, freq, amplitude), y: 0 };
    case 'vestibular-peripheral':
      // horizontal-torsional in reality; approximate as horizontal jerk, fatigable
      return { x: sawtooth(t, freq, amplitude * Math.max(0.2, 1 - t * 0.05)), y: 0 };
    case 'vestibular-central':
      // purely vertical or direction-changing, non-fatigable
      return { x: 0, y: sawtooth(t, freq, amplitude) };
    case 'pendular':
      return { x: Math.sin(t * freq * Math.PI * 2) * amplitude, y: 0 };
    case 'periodic-alternating': {
      // direction reverses every ~20s cycle (compressed from the real ~90s for visibility)
      const dir = Math.sin((t / 20) * Math.PI) >= 0 ? 1 : -1;
      return { x: sawtooth(t, freq, amplitude) * dir, y: 0 };
    }
    case 'see-saw':
      // one eye rises as the other falls — handled per-eye by the caller passing a sign
      return { x: 0, y: Math.sin(t * freq * Math.PI * 2) * amplitude };
    case 'flutter':
    case 'opsoclonus': {
      // chaotic multidirectional bursts — sum of unrelated-frequency sines
      const x = (Math.sin(t * 11) + Math.sin(t * 17.3) * 0.6) * (amplitude * 0.5);
      const y = (Math.cos(t * 13.7) + Math.sin(t * 9.1) * 0.5) * (amplitude * 0.5);
      return { x, y };
    }
    case 'square-wave-jerks': {
      // brief small saccadic jumps off primary position, then back
      const cycle = (t * 0.6) % 1;
      const jump = cycle < 0.05 || (cycle > 0.5 && cycle < 0.55);
      return { x: jump ? amplitude * 0.6 : 0, y: 0 };
    }
    case 'ocular-bobbing': {
      const cycle = (t * 0.8) % 1;
      // fast down, slow return, pause
      if (cycle < 0.1) return { x: 0, y: amplitude * (cycle / 0.1) };
      if (cycle < 0.4) return { x: 0, y: amplitude * (1 - (cycle - 0.1) / 0.3) };
      return { x: 0, y: 0 };
    }
    case 'ocular-dipping': {
      const cycle = (t * 0.5) % 1;
      // slow down, fast return
      if (cycle < 0.6) return { x: 0, y: amplitude * (cycle / 0.6) };
      return { x: 0, y: amplitude * (1 - (cycle - 0.6) / 0.4) };
    }
    case 'superior-oblique-myokymia':
      // tiny, fast, high-frequency torsional jitter — approximated as small xy tremor
      return { x: Math.sin(t * 40) * 1, y: Math.cos(t * 37) * 0.6 };
    case 'convergence-retraction': {
      // triggered on attempted upgaze: caller sets base gazeY negative (up);
      // this adds an inward burst
      const cycle = (t * 1.2) % 1;
      return { x: cycle < 0.15 ? -amplitude * 0.8 : 0, y: 0 };
    }
    case 'none':
    default:
      return { x: 0, y: 0 };
  }
}
