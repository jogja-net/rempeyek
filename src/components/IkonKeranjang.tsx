'use client';

// src/components/IkonKeranjang.tsx — tautan ke /keranjang dengan lencana jumlah.

import { useKeranjang } from './KeranjangProvider';

export default function IkonKeranjang() {
  const { jumlah, siap } = useKeranjang();
  const tampil = siap && jumlah > 0;

  return (
    <a
      href="/keranjang"
      aria-label={siap ? `Keranjang, ${jumlah} barang` : 'Keranjang'}
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-kakao no-underline hover:bg-kraft"
    >
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6" />
      </svg>
      {tampil && (
        <span className="absolute -top-0.5 -right-0.5 min-w-5 rounded-full bg-cabai px-1 text-center text-[12px] leading-5 font-bold text-white">
          {jumlah > 99 ? '99+' : jumlah}
        </span>
      )}
    </a>
  );
}
