'use client';
import { SOURCES } from '@/lib/content';
import type { SessionState } from '@/lib/state';
import type { Scene } from '@/lib/scenes';
import type { Ctx } from '../StageApp';

export type SceneProps = { s: SessionState; step: number; scene: Scene; idx: number; ctx: Ctx; send: (k: string, d?: any, pid?: string) => any };

// Reveal on a build step. Children fade and rise in once step >= b.
export function R({ b = 0, step, d = 0, className = '', children, style, as: Tag = 'div' }: { b?: number; step: number; d?: number; className?: string; children?: React.ReactNode; style?: React.CSSProperties; as?: any }) {
  return <Tag className={`rv ${step >= b ? 'on' : ''} ${className}`} style={{ ['--d' as any]: `${d}ms`, ...style }}>{children}</Tag>;
}

export const Src = ({ k, extra, style }: { k: string | string[]; extra?: string; style?: React.CSSProperties }) => (
  <div className="src stage-src" style={style}>Source: {(Array.isArray(k) ? k : [k]).map((x) => SOURCES[x]).join('; ')}{extra ? `. ${extra}` : ''}</div>
);

export const Enter = ({ i = 0, children, className = '', style }: { i?: number; children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={'enter ' + className} style={{ ['--i' as any]: i, ...style }}>{children}</div>
);

export function spectrumAt(w: number) {
  const stops = [[255, 150, 160], [255, 214, 140], [190, 240, 190], [170, 228, 242], [200, 184, 255], [255, 170, 220]];
  const x = Math.max(0, Math.min(0.9999, w)) * (stops.length - 1); const i = Math.floor(x), f = x - i;
  const a = stops[i], b = stops[i + 1] || a;
  return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * f)).join(',')})`;
}
