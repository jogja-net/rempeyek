'use client';

// Menu samping admin dengan ikon dan penanda halaman aktif (gaya Lapakku/Filament).
// Client component hanya karena butuh `usePathname`; datanya statis.

import { usePathname } from 'next/navigation';

import Ikon, { type NamaIkon } from './Ikon';

const KELOMPOK: { judul: string | null; menu: { href: string; teks: string; ikon: NamaIkon }[] }[] = [
  { judul: null, menu: [{ href: '/admin', teks: 'Dashboard', ikon: 'beranda' }] },
  { judul: 'Transaksi', menu: [{ href: '/admin/pesanan', teks: 'Pesanan', ikon: 'pesanan' }] },
  { judul: 'Katalog', menu: [{ href: '/admin/produk', teks: 'Produk', ikon: 'produk' }] },
  { judul: 'Laporan', menu: [{ href: '/admin/laporan', teks: 'Laporan penjualan', ikon: 'laporan' }] },
];

export default function MenuAdmin() {
  const path = usePathname();
  const aktif = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));

  return (
    <nav aria-label="Menu admin" className="space-y-5">
      {KELOMPOK.map((k) => (
        <div key={k.judul ?? 'utama'}>
          {k.judul !== null && <p className="mb-1.5 px-3 text-xs font-semibold text-redup/60">{k.judul}</p>}
          <ul className="space-y-0.5">
            {k.menu.map((m) => (
              <li key={m.href}>
                <a
                  href={m.href}
                  aria-current={aktif(m.href) ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition-colors duration-150 ${
                    aktif(m.href) ? 'bg-kakao font-semibold text-kertas' : 'text-redup hover:bg-kraft/60 hover:text-kakao'
                  }`}
                >
                  <Ikon nama={m.ikon} className={`h-[18px] w-[18px] ${aktif(m.href) ? 'text-emas' : ''}`} />
                  {m.teks}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
