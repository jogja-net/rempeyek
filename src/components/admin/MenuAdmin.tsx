'use client';

// Menu samping admin dengan penanda halaman aktif (gaya Lapakku/Filament).
// Client component hanya karena butuh `usePathname`; datanya statis.

import { usePathname } from 'next/navigation';

const KELOMPOK = [
  { judul: null, menu: [{ href: '/admin', teks: 'Dashboard' }] },
  { judul: 'Transaksi', menu: [{ href: '/admin/pesanan', teks: 'Pesanan' }] },
  { judul: 'Katalog', menu: [{ href: '/admin/produk', teks: 'Produk' }] },
  { judul: 'Laporan', menu: [{ href: '/admin/laporan', teks: 'Laporan penjualan' }] },
] as const;

export default function MenuAdmin() {
  const path = usePathname();
  const aktif = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));

  return (
    <nav aria-label="Menu admin" className="space-y-5">
      {KELOMPOK.map((k) => (
        <div key={k.judul ?? 'utama'}>
          {k.judul !== null && (
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-redup/70">{k.judul}</p>
          )}
          <ul className="space-y-1">
            {k.menu.map((m) => (
              <li key={m.href}>
                <a
                  href={m.href}
                  aria-current={aktif(m.href) ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    aktif(m.href)
                      ? 'bg-emas/25 font-semibold text-kakao'
                      : 'text-redup hover:bg-kraft/60'
                  }`}
                >
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
