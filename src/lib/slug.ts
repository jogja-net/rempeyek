// src/lib/slug.ts
//
// Slug produk yang ramah URL dan unik. Dipakai saat admin membuat produk baru
// (Task 8) supaya dua nama berbeda tidak pernah menabrak `UNIQUE` di tabel produk.

/** Gabungan tanda diakritik yang tersisa setelah dekomposisi NFD. */
const DIAKRITIK = /[\u0300-\u036f]/g;

/**
 * Mengubah nama jadi slug: huruf kecil, aksen dibuang, selain huruf/angka
 * jadi tanda hubung, dan tanda hubung berlebih dirapikan.
 *
 * @param nama      Nama produk apa adanya dari admin.
 * @param sudahAda  Slug yang sudah dipakai di database.
 * @returns Slug unik; diberi akhiran `-2`, `-3`, … bila perlu.
 *
 * Nama tanpa huruf/angka sama sekali (mis. `"???"`) jatuh ke `"produk"`,
 * lalu tetap diberi akhiran bila `"produk"` pun sudah ada.
 */
export function buatSlug(nama: string, sudahAda: string[]): string {
  const dasar = turunkanDasar(nama);
  if (!sudahAda.includes(dasar)) return dasar;

  for (let urutan = 2; ; urutan += 1) {
    const calon = `${dasar}-${urutan}`;
    if (!sudahAda.includes(calon)) return calon;
  }
}

function turunkanDasar(nama: string): string {
  const bersih = nama
    .normalize('NFD')
    .replace(DIAKRITIK, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return bersih === '' ? 'produk' : bersih;
}
