// src/lib/format.ts

/**
 * Format angka jadi "Rp 12.500". Nilai `null` → "Tanya harga", supaya pembeli
 * tahu harus bertanya, bukan melihat kode kosong.
 */
export function formatRupiah(nilai: number | null | undefined): string {
  if (nilai === null || nilai === undefined) return 'Tanya harga';
  return `Rp ${nilai.toLocaleString('id-ID')}`;
}

/** Berat dalam gram. `null` → teks kosong. */
export function formatBerat(gram: number | null | undefined): string {
  if (gram === null || gram === undefined) return '';
  return `${gram.toLocaleString('id-ID')} g`;
}

/** Waktu ISO → "14 Nov 2026 07.30" menurut WIB; teks asli bila tidak valid. */
export function formatWaktuWib(iso: string | null | undefined): string {
  if (iso === null || iso === undefined) return '-';
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return iso;
  return t.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Teks bebas. Kosong/`null` → placeholder yang diberikan. */
export function atau(nilai: string | null | undefined, placeholder: string): string {
  return nilai && nilai.trim() !== '' ? nilai : placeholder;
}

/** Angka bebas. `null` → placeholder yang diberikan. */
export function atauAngka(nilai: number | null | undefined, placeholder: string): string {
  return nilai === null || nilai === undefined ? placeholder : nilai.toLocaleString('id-ID');
}
