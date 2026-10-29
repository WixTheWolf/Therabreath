'use client';
// The presentation (/host) and its presenter view (/host/presenter) talk over a BroadcastChannel, so both have to be
// open in the same browser on the same laptop: the presentation full screen on the TV, the presenter view on the
// laptop's own screen. The presentation stays the source of truth; the presenter view only asks it to move.
export type ShowPos = { i: number; step: number; short: boolean; blank: boolean; at: number; total: number; next: string };
export type ShowCmd = { c: 'go'; d: number } | { c: 'jump'; d: number } | { c: 'goto'; i: number; step?: number } | { c: 'short' } | { c: 'blank' };
export type ShowMsg = { t: 'pos'; pos: ShowPos } | { t: 'hello' } | { t: 'cmd'; cmd: ShowCmd };

export const showChannel = (code: string) => (typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pb-show-' + code) : null);
export const presenterUrl = (code: string) => `/host/presenter?code=${encodeURIComponent(code)}`;
