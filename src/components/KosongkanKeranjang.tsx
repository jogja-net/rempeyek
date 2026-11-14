'use client';

// src/components/KosongkanKeranjang.tsx
//
// Mengosongkan keranjang SEKALI setelah pesanan berhasil dibuat (halaman
// konfirmasi dibuka dengan `?baru=1`), lalu menghapus tanda itu dari URL.
// Membuka tautan konfirmasi lama (tanpa tanda) tidak menyentuh keranjang.

import { useEffect, useRef } from 'react';

import { useKeranjang } from './KeranjangProvider';

export default function KosongkanKeranjang({ aktif }: { aktif: boolean }) {
  const { kosongkan, siap } = useKeranjang();
  const sudah = useRef(false);

  useEffect(() => {
    // Sekali saja: `aktif` berasal dari server dan tetap true setelah URL dibersihkan.
    if (!aktif || !siap || sudah.current) return;
    sudah.current = true;
    kosongkan();
    window.history.replaceState(null, '', window.location.pathname);
  }, [aktif, siap, kosongkan]);

  return null;
}
