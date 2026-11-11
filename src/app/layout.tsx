import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import { site } from '@/data/site';
import './globals.css';

// Font di-self-host dari berkas lokal, bukan diambil dari Google saat build.
// Alasan: pengambilan font Google saat build pernah menggagalkan build dengan
// "An error occurred in `next/font`" (TypeError: Cannot read properties of null)
// baik di lokal maupun di Vercel. Berkas + lisensi ada di src/app/fonts/.
// Nama variabel CSS (--font-bricolage, --font-jakarta) dipertahankan sama,
// jadi globals.css dan seluruh komponen tidak perlu diubah.
const bricolage = localFont({
  src: [{ path: './fonts/bricolage-grotesque-latin.woff2', weight: '200 800', style: 'normal' }],
  variable: '--font-bricolage',
  display: 'swap',
});

const jakarta = localFont({
  src: [{ path: './fonts/plus-jakarta-sans-latin.woff2', weight: '200 800', style: 'normal' }],
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
