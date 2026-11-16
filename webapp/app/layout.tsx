import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import './theme.css';

const poppins = Poppins({
  variable: '--font-poppins-custom',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Habico | Connecting People, Creating Solutions.',
  description: 'Het overzicht voor jouw studentenhuis.',
};

export const viewport: Viewport = { viewportFit: 'cover' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="nl" className={`${poppins.variable} h-full antialiased`}>
      <body className="font-poppins min-h-full">{children}</body>
    </html>
  );
}
