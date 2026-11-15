'use client';

// src/components/KeranjangProvider.tsx
//
// Menyimpan keranjang di `localStorage` (kunci `keranjang-v1`) dan membagikannya
// lewat context. Semua akses storage dibungkus try/catch: di jendela pribadi,
// dengan data situs diblokir, atau saat kuota penuh, keranjang tetap bekerja
// selama tab terbuka (hanya tidak bertahan setelah muat ulang).
//
// Dibaca di `useEffect`, bukan saat render pertama, supaya HTML server dan
// klien sama (tidak ada galat hidrasi). `siap` memberi tahu halaman kapan
// isi keranjang sudah terbaca, supaya tidak berkedip "keranjang kosong".

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  bacaKeranjang,
  jumlahBarang,
  KUNCI_KERANJANG,
  tambah as tambahItem,
  ubahJumlah as ubahItem,
  type ItemKeranjang,
} from '@/lib/keranjang';

type NilaiKeranjang = {
  items: ItemKeranjang[];
  siap: boolean;
  jumlah: number;
  tambah: (produkId: number, n?: number) => void;
  ubahJumlah: (produkId: number, jumlah: number) => void;
  kosongkan: () => void;
};

const KonteksKeranjang = createContext<NilaiKeranjang | null>(null);

function simpan(items: ItemKeranjang[]): void {
  try {
    window.localStorage.setItem(KUNCI_KERANJANG, JSON.stringify(items));
  } catch {
    // Storage tidak tersedia/penuh: abaikan, keranjang tetap hidup di memori.
  }
}

export function KeranjangProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemKeranjang[]>([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    let mentah: string | null = null;
    try {
      mentah = window.localStorage.getItem(KUNCI_KERANJANG);
    } catch {
      mentah = null;
    }
    setItems(bacaKeranjang(mentah));
    setSiap(true);
  }, []);

  // Pembaruan fungsional + simpan di dalamnya: dua klik beruntun tidak saling menimpa.
  const ubah = useCallback((fn: (k: ItemKeranjang[]) => ItemKeranjang[]) => {
    setItems((sebelum) => {
      const sesudah = fn(sebelum);
      simpan(sesudah);
      return sesudah;
    });
  }, []);

  // Fungsi aksi dibuat STABIL (identitasnya tidak berubah saat isi keranjang
  // berubah). Bila tidak, efek yang bergantung padanya, mis. KosongkanKeranjang,
  // berjalan ulang pada setiap perubahan dan memicu loop pembaruan tak berujung.
  const tambah = useCallback(
    (produkId: number, n = 1) => ubah((k) => tambahItem(k, produkId, n)),
    [ubah],
  );
  const ubahJumlah = useCallback(
    (produkId: number, jumlah: number) => ubah((k) => ubahItem(k, produkId, jumlah)),
    [ubah],
  );
  // Sudah kosong → kembalikan daftar yang sama supaya tidak memicu render ulang.
  const kosongkan = useCallback(() => ubah((k) => (k.length === 0 ? k : [])), [ubah]);

  const nilai = useMemo<NilaiKeranjang>(
    () => ({ items, siap, jumlah: jumlahBarang(items), tambah, ubahJumlah, kosongkan }),
    [items, siap, tambah, ubahJumlah, kosongkan],
  );

  return <KonteksKeranjang.Provider value={nilai}>{children}</KonteksKeranjang.Provider>;
}

export function useKeranjang(): NilaiKeranjang {
  const nilai = useContext(KonteksKeranjang);
  if (nilai === null) {
    throw new Error('useKeranjang harus dipakai di dalam KeranjangProvider');
  }
  return nilai;
}
