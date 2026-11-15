// src/lib/jsonld.ts
//
// Serialisasi JSON-LD yang aman ditaruh di dalam <script type="application/ld+json">.
//
// `JSON.stringify` biasa tidak meng-escape "<", jadi teks seperti "</script>" bisa
// menutup tag lebih awal dan menyuntikkan HTML. Karakter berbahaya diganti dengan
// escape Unicode yang setara; `JSON.parse` tetap menghasilkan nilai yang sama.

// Dibangun dari kode karakter agar berkas ini tidak memuat pemisah baris Unicode mentah.
const PEMISAH_BARIS = String.fromCharCode(0x2028);
const PEMISAH_PARAGRAF = String.fromCharCode(0x2029);

export function serialisasiJsonLd(nilai: unknown): string {
  return JSON.stringify(nilai)
    .split('<')
    .join('\\u003c')
    .split(PEMISAH_BARIS)
    .join('\\u2028')
    .split(PEMISAH_PARAGRAF)
    .join('\\u2029');
}
