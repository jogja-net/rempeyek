'use client';

// Navigasi bawah khusus HP (md ke atas memakai sidebar). Empat tujuan utama,
// area sentuh minimal 44px, dan menghormati area aman perangkat (notch/home bar).

import { usePathname } from 'next/navigation';

import Ikon, { type NamaIkon } from './Ikon';

const MENU: { href: string; teks: string; ikon: NamaIkon }[] = [
  { href: '/admin', teks: 'Dashboard', ikon: 'beranda' },
  { href: '/admin/pesanan', teks: 'Pesanan', ikon: 'pesanan' },
  { href: '/admin/produk', teks: 'Produk', ikon: 'produk' },
  { href: '/admin/laporan', teks: 'Laporan', ikon: 'laporan' },
];

export default function BarBawah() {
  const path = usePathname();
  const aktif = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));

  return (
    <nav
      aria-label="Menu admin"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-kraft-garis bg-kertas pb-[env(safe-area-inset-bottom)] md:hidden print:hidden"
    >
      <ul className="flex">
        {MENU.map((m) => (
          <li key={m.href} className="flex-1">
            <a
              href={m.href}
              aria-current={aktif(m.href) ? 'page' : undefined}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs transition-colors duration-150 ${
                aktif(m.href) ? 'font-semibold text-kakao' : 'text-redup'
              }`}
            >
              {aktif(m.href) && <span aria-hidden="true" className="absolute inset-x-5 top-0 h-0.5 rounded-b bg-emas" />}
              <Ikon nama={m.ikon} className={`h-5 w-5 ${aktif(m.href) ? 'text-cabai' : ''}`} />
              {m.teks}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
