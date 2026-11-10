// src/data/site.ts
// Identitas toko. Nilai `null` = data belum diisi Bu Aviella → dirender sebagai placeholder.

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
