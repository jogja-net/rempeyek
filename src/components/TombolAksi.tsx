'use client';

// src/components/TombolAksi.tsx
//
// Tombol kirim formulir yang terkunci selama server action berjalan, supaya
// tidak terklik dua kali. (Server tetap aman dari klik ganda lewat UPDATE
// bersyarat di repositori; ini hanya merapikan pengalaman pemakai.)
// `konfirmasi` meminta persetujuan dulu untuk aksi yang tidak bisa dibatalkan.

import { useFormStatus } from 'react-dom';

const GAYA = {
  utama: 'bg-cabai text-kertas hover:bg-cabai-tua',
  netral: 'border border-kraft-garis bg-kertas text-kakao hover:bg-kraft',
  bahaya: 'border border-cabai/40 bg-kertas text-cabai-tua hover:bg-cabai/10',
} as const;

export default function TombolAksi({
  children,
  gaya = 'utama',
  konfirmasi,
}: {
  children: React.ReactNode;
  gaya?: keyof typeof GAYA;
  konfirmasi?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (konfirmasi !== undefined && !window.confirm(konfirmasi)) e.preventDefault();
      }}
      className={`min-h-11 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${GAYA[gaya]}`}
    >
      {pending ? 'Memproses…' : children}
    </button>
  );
}
