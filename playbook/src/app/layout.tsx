import './globals.css';
import './stage.css';
import './room.css';
import './site.css';
import './console.css';
import './playbook.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'The Flavor Playbook',
  description: 'TheraBreath × The Flavor Factory. A live workshop, November 9, 2026.',
  robots: { index: false, follow: false, nocache: true },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0B1B2B' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-theme="b"><body>{children}</body></html>;
}
