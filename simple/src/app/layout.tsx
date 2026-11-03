import './globals.css';
import './stage.css';
import './room.css';
import './site.css';
import './console.css';
import './playbook.css';
import './simple.css';
import './show.css';
import './writeup.css';
import type { Metadata, Viewport } from 'next';
import { preload } from 'react-dom';

export const metadata: Metadata = {
  // The name on the door. Each page adds its own name in front, so the team can tell their tabs apart.
  title: { default: 'The Future of Freshness', template: '%s | The Future of Freshness' },
  description: 'TheraBreath × The Flavor Factory. A live workshop, November 9, 2026.',
  robots: { index: false, follow: false, nocache: true },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0B1B2B' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The headline serif and the body sans are on every first screen, so the browser fetches them before it reaches the CSS.
  for (const f of ['newsreader-latin-opsz-normal', 'Geist-Variable']) preload(`/fonts/${f}.woff2`, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  return <html lang="en" data-theme="b"><body>{children}</body></html>;
}
