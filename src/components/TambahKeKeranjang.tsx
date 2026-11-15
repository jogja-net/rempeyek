'use client';

// src/components/TambahKeKeranjang.tsx
//
// Tombol "Tambah ke keranjang" untuk kartu dan halaman produk. Hanya dirender
// saat marketplace aktif (di dalam KeranjangProvider).
// `habis` → nonaktif; `po` → berlabel "Pre-order" (tetap bisa dipesan).

import { useEffect, useState } from 'react';

import { useKeranjang } from './KeranjangProvider';

const GAYA_BAWAAN =
  'inline-flex min-h-11 items-center rounded-full border-2 border-cabai px-[18px] text-isi font-bold whitespace-nowrap text-cabai hover:bg-cabai hover:text-white disabled:cursor-not-allowed disabled:border-kraft-garis disabled:bg-kraft disabled:text-redup disabled:hover:bg-kraft disabled:hover:text-redup';

export default function TambahKeKeranjang({
  produkId,
  nama,
  status,
  className = GAYA_BAWAAN,
}: {
  produkId: number;
  nama: string;
  status: 'tersedia' | 'po' | 'habis';
  className?: string;
}) {
  const { tambah } = useKeranjang();
  const [baruDitambah, setBaruDitambah] = useState(false);

  useEffect(() => {
    if (!baruDitambah) return;
    const t = setTimeout(() => setBaruDitambah(false), 1500);
    return () => clearTimeout(t);
  }, [baruDitambah]);

  const habis = status === 'habis';
  const label = habis ? 'Habis' : baruDitambah ? 'Ditambahkan ✓' : status === 'po' ? 'Pre-order' : 'Tambah ke keranjang';

  return (
    <button
      type="button"
      disabled={habis}
      aria-label={habis ? `${nama} habis` : `Tambah ${nama} ke keranjang${status === 'po' ? ' (pre-order)' : ''}`}
      onClick={() => {
        tambah(produkId, 1);
        setBaruDitambah(true);
      }}
      className={className}
    >
      <span aria-live="polite">{label}</span>
    </button>
  );
}
