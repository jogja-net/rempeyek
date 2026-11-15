import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import { site } from '@/data/site';
import { KeranjangProvider } from '@/components/KeranjangProvider';
import { bolehDiindeks, marketplaceAktif } from '@/lib/mode';
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
// Kata kunci utama ("peyek kacang", ±6.600 pencarian/bulan di Indonesia, riset 15 Nov 2026)
// berada di awal, diikuti nama usaha, kota, dan ajakan bertindak.
// Contoh terisi (kota "Sleman"): "Peyek Kacang Renyah Bu Aviella, Sleman | Pesan WA" = 49 karakter.
const judul = `Peyek Kacang Renyah Bu Aviella${site.kota ? `, ${site.kota}` : ''} | Pesan WA`;
const deskripsi =
  'Peyek kacang tanah, kacang hijau, teri, dan rebon dari dapur rumah di Sleman. Digoreng tipis, dikemas setelah dingin. Pesan via WA, bisa kirim luar kota.';

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
    index: bolehDiindeks(),
    follow: bolehDiindeks(),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${bricolage.variable} ${jakarta.variable}`}>
      <body>
        {/* Provider keranjang hanya dipasang saat marketplace aktif; di produksi
            halaman identik dengan sebelum Fase 2 (tanpa JS tambahan). */}
        {marketplaceAktif() ? <KeranjangProvider>{children}</KeranjangProvider> : children}
        <Analytics />
      </body>
    </html>
  );
}
