// src/app/checkout/aksi.ts
//
// Dua server action checkout. Keduanya endpoint publik: semua masukan dianggap
// tidak dipercaya. Harga, nama, dan berat dibaca ulang dari database; yang
// dipercaya dari browser hanya "produk mana, berapa banyak, dan tujuan".

'use server';

import { notFound, redirect } from 'next/navigation';

import { getDb } from '@/lib/db/client';
import { alamatIp } from '@/lib/ip';
import { bacaKeranjang } from '@/lib/keranjang';
import { cekBatas } from '@/lib/laju';
import { marketplaceAktif } from '@/lib/mode';
import { hitungOngkir, type OpsiOngkir } from '@/lib/ongkir';
import { buatPesanan } from '@/lib/pesanan-repo';
import { ambilProdukById } from '@/lib/produk-repo';

const MAKS_PESANAN_PER_JAM = 10;
const JENDELA_DETIK = 60 * 60;

/** "nomor HP tidak valid" → "Nomor HP tidak valid." */
function rapikan(galat: string): string {
  const teks = galat.trim();
  return teks === '' ? 'Terjadi kesalahan.' : `${teks[0].toUpperCase()}${teks.slice(1)}.`;
}

export type HasilOpsiOngkir =
  | { ok: true; opsi: OpsiOngkir[] }
  | { ok: false; galat: string };

/**
 * Daftar opsi ongkir untuk isi keranjang dan provinsi tujuan.
 * Berat dihitung dari database, bukan dari browser.
 */
export async function opsiOngkirAksi(itemsMentah: string, provinsi: string): Promise<HasilOpsiOngkir> {
  if (!marketplaceAktif()) notFound();

  const items = bacaKeranjang(itemsMentah);
  if (items.length === 0) return { ok: false, galat: 'Keranjang masih kosong.' };

  const db = getDb();
  let beratGram = 0;
  for (const item of items) {
    const produk = await ambilProdukById(db, item.produkId);
    if (produk === null || produk.diarsipkan || produk.status === 'habis') {
      return { ok: false, galat: 'Ada produk di keranjang yang sudah tidak tersedia.' };
    }
    beratGram += produk.berat_gram * item.jumlah;
  }

  try {
    return { ok: true, opsi: hitungOngkir({ beratGram, provinsi }) };
  } catch {
    return { ok: false, galat: 'Provinsi tidak dikenal.' };
  }
}

/** Mengembalikan `{ galat }` bila gagal; bila berhasil mengalihkan ke halaman konfirmasi. */
export async function buatPesananAksi(formData: FormData): Promise<{ galat: string } | void> {
  if (!marketplaceAktif()) notFound();

  const teks = (kolom: string, maks: number): string | null => {
    const nilai = formData.get(kolom);
    if (typeof nilai !== 'string' || nilai.length > maks) return null;
    return nilai;
  };

  const nama = teks('nama', 100);
  const hp = teks('hp', 30);
  const alamat = teks('alamat', 400);
  const provinsi = teks('provinsi', 60);
  const kota = teks('kota', 100);
  const kodeOngkir = teks('kodeOngkir', 20);
  const itemsMentah = teks('items', 5000);

  if (
    nama === null || hp === null || alamat === null || provinsi === null ||
    kota === null || kodeOngkir === null || itemsMentah === null
  ) {
    return { galat: 'Data tidak lengkap atau terlalu panjang.' };
  }

  const db = getDb();
  const ip = await alamatIp();
  const boleh = await cekBatas(db, `checkout:${ip}`, MAKS_PESANAN_PER_JAM, JENDELA_DETIK, Date.now());
  if (!boleh) {
    return { galat: 'Terlalu banyak percobaan pesanan dari jaringan ini. Coba lagi nanti.' };
  }

  const hasil = await buatPesanan(db, {
    nama,
    hp,
    alamat,
    provinsi,
    kota,
    kodeOngkir,
    items: bacaKeranjang(itemsMentah),
  });

  if (!hasil.ok) return { galat: rapikan(hasil.galat) };

  // `?baru=1` memberi tanda ke halaman konfirmasi untuk mengosongkan keranjang
  // satu kali saja; membuka tautan lama kemudian tidak menghapus keranjang baru.
  redirect(`/pesanan/${hasil.data.nomor}?baru=1`);
}
