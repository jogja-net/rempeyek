// src/data/site.ts
// Identitas toko. Nilai `null` = data belum diisi Bu Aviella → dirender sebagai placeholder.

/** Baca env; nilai kosong/spasi dianggap belum diisi. */
function dariEnv(nama: string, bawaan: string): string {
  const nilai = (process.env[nama] ?? '').trim();
  return nilai === '' ? bawaan : nilai;
}

export const site = {
  nama: 'Rempeyek Bu Aviella',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  // Format 62xxxxxxxxxx tanpa tanda +, spasi, atau tanda hubung.
  whatsapp: process.env.NEXT_PUBLIC_WA_NUMBER ?? (null as string | null),
  kota: 'Sleman' as string | null,
  alamat:
    'Jl. Kaliurang KM 10,12, Dentan, Sinduharjo, Kec. Ngaglik, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55581' as string | null,
  jamLayanan: null as string | null,
  areaKirim: null as string | null,
  kurir: [] as string[],
  bank: [] as string[],
  // Rekening tujuan transfer (spec §90). BUKAN layar admin: nilainya dari env
  // supaya bisa diganti tanpa deploy. Bawaan sengaja jelas palsu untuk demo.
  rekening: {
    bank: dariEnv('REKENING_BANK', 'BANK DEMO'),
    nomor: dariEnv('REKENING_NOMOR', '0000-0000-0000'),
    atasNama: dariEnv('REKENING_NAMA', 'DEMO BU AVIELLA'),
  },
  instagram: null as string | null,
  tiktok: null as string | null,
  shopee: null as string | null,
  tampilkanSambal: true,
  // Badge legalitas HANYA dirender kalau nilainya terisi (lihat HANDOFF §4 & PRD §12).
  legalitas: { pirt: null as string | null, halal: null as string | null },
  hampers: { tutupPO: null as string | null, minimalPaket: null as number | null },
} as const;

// Nomor WA contoh untuk teks placeholder di footer/sticky bar, bukan nomor asli.
export const WA_PLACEHOLDER = '[NOMOR]';
