import { useState, useCallback } from 'react';
import { computeEyeState, PATHOLOGIES } from "../lib/pathologies";
import type { LightSide } from "../lib/eyeState";
import { useAnimationFrame } from "../lib/useAnimationFrame";

function Eye({ cx, gazeX, gazeY, pupilDiameter, lidPosition, label }: {
  cx: number; gazeX: number; gazeY: number; pupilDiameter: number; lidPosition: number; label: string;
}) {
  const px = 100 + gazeX;
  const py = 100 + gazeY;
  const pupilR = 12 + pupilDiameter * 3.2;
  const lidY = 100 - 95 * Math.min(1.3, Math.max(0, lidPosition)) + 5;

  return (
    <svg viewBox="0 0 200 200" width="180" height="180" role="img" aria-label={label}>
      <circle cx="100" cy="100" r="95" fill="var(--surface-1)" stroke="var(--border-strong)" strokeWidth="1" />
      <circle cx={px} cy={py} r="55" fill="#3f6b8a" />
      <circle cx={px} cy={py} r={pupilR} fill="#111" />
      <circle cx={px - 18} cy={py - 18} r="8" fill="rgba(255,255,255,0.5)" />
      {/* upper lid, simple ptosis/retraction approximation */}
      <path d={`M5 ${lidY} Q100 ${lidY - 20} 195 ${lidY} L195 0 L5 0 Z`} fill="var(--surface-2)" />
    </svg>
  );
}

export default function EyePair() {
  const [pathologyId, setPathologyId] = useState('normal');
  const [lightSide, setLightSide] = useState<LightSide>('off');
  const [t, setT] = useState(0);

  useAnimationFrame(useCallback((time: number) => setT(time), []));

  const { left, right } = computeEyeState(pathologyId, t, lightSide);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={pathologyId} onChange={(e) => setPathologyId(e.target.value)}>
          {PATHOLOGIES.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button onClick={() => setLightSide('left')}>Light: left eye</button>
        <button onClick={() => setLightSide('right')}>Light: right eye</button>
        <button onClick={() => setLightSide('off')}>Light off</button>
      </div>
      <div style={{ display: 'flex', gap: 40, justifyContent: 'center' }}>
        <Eye cx={0} gazeX={left.gazeX} gazeY={left.gazeY} pupilDiameter={left.pupilDiameter} lidPosition={left.lidPosition} label="Left eye" />
        <Eye cx={0} gazeX={right.gazeX} gazeY={right.gazeY} pupilDiameter={right.pupilDiameter} lidPosition={right.lidPosition} label="Right eye" />
      </div>
    </div>
  );
}
