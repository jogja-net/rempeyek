// src/lib/whatsapp.ts
import { site } from '@/data/site';

/** Nomor placeholder yang dipakai selama nomor WA asli belum diisi. */
const NOMOR_PLACEHOLDER = '62XXXXXXXXXX';

/**
 * Bangun link WhatsApp. Nomor `null` memakai fallback placeholder supaya halaman
 * tetap bisa diklik & dilihat di staging (HANDOFF §5).
 *
 * Catatan: placeholder sengaja TIDAK dinormalisasi lewat `replace(/\D/g, '')`,
 * karena kalau disaring ia akan menyusut jadi "62" saja dan tautannya jadi menyesatkan.
 * Nomor asli tetap dinormalisasi (buang +, spasi, tanda hubung).
 */
export function buildWaLink(nomor: string | null, pesan: string): string {
  const bersih = (nomor ?? '').replace(/\D/g, '');
  const n = bersih.length > 0 ? bersih : NOMOR_PLACEHOLDER;
  return `https://wa.me/${n}?text=${encodeURIComponent(pesan)}`;
}

// Template pesan (HANDOFF §5) — jangan diubah tanpa memperbarui HANDOFF.
export const pesan = {
  umum: 'Halo Bu Aviella, saya mau pesan rempeyek.',
  produk: (nama: string) => `Halo Bu Aviella, saya mau pesan ${nama} x 1.\nNama: \nAlamat: `,
  produkPo: (nama: string) => `Halo Bu Aviella, saya mau pre-order ${nama} x 1.\nNama: \nAlamat: `,
  sambal: (nama: string) => `Halo Bu Aviella, saya mau tambah ${nama} x 1 ke pesanan rempeyek.`,
  hampers: 'Halo Bu Aviella, saya mau tanya paket hampers.\nJumlah: \nTanggal acara: \nBudget: ',
  reseller: 'Halo Bu Aviella, saya tertarik jadi reseller rempeyek.',
} as const;

export function waUmum() {
  return buildWaLink(site.whatsapp, pesan.umum);
}

export function waHampers() {
  return buildWaLink(site.whatsapp, pesan.hampers);
}

export function waReseller() {
  return buildWaLink(site.whatsapp, pesan.reseller);
}
