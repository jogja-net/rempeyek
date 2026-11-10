import type { Metadata } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { site } from '@/data/site';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

// Title ≤ 60 karakter setelah kota diisi (HANDOFF §8).
// Contoh terisi (kota "Sleman"): "Rempeyek Kacang Renyah Bu Aviella – Sleman | Pesan WA" = 55 karakter.
const judul = `Rempeyek Kacang Renyah Bu Aviella – ${site.kota ?? '[KOTA]'} | Pesan WA`;
const deskripsi =
  'Rempeyek kacang tanah, kacang hijau, teri, dan rebon. Digoreng tipis, dikemas setelah dingin. Pesan langsung ke Bu Aviella lewat WhatsApp, bisa kirim luar kota.';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: judul,
  description: deskripsi,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: site.url,
    siteName: site.nama,
    title: judul,
    description: deskripsi,
  },
  twitter: {
    card: 'summary_large_image',
    title: judul,
    description: deskripsi,
  },
  robots: {
    // Google hanya boleh mengindeks versi produksi.
    index: process.env.VERCEL_ENV === 'production',
    follow: process.env.VERCEL_ENV === 'production',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${bricolage.variable} ${jakarta.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
