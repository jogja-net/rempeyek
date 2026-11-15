// src/app/lacak/aksi.ts
//
// Pencarian resi publik. Dibatasi 10 percobaan/menit per IP supaya nomor resi
// tidak bisa ditebak beruntun, dan hasilnya tidak membocorkan data pribadi:
// `lacakByResi` sengaja tidak mengembalikan alamat, HP, maupun nama pembeli.
// Resi yang tidak ada dijawab generik (tanpa membedakan "format salah" dari
// "tidak ada").

'use server';

import { notFound } from 'next/navigation';

import { getDb } from '@/lib/db/client';
import { alamatIp } from '@/lib/ip';
import { cekBatas } from '@/lib/laju';
import { marketplaceAktif } from '@/lib/mode';
import { lacakByResi } from '@/lib/pesanan-repo';
import type { StatusPesanan } from '@/lib/status';

export type HasilLacak =
  | { jenis: 'ketemu'; resi: string; status: StatusPesanan; kurir: string; dikirimPada: string | null; ringkasan: { nama: string; jumlah: number }[] }
  | { jenis: 'tidak-ada' }
  | { jenis: 'dibatasi' }
  | { jenis: 'kosong' };

const MAKS_PERCOBAAN = 10;
const JENDELA_DETIK = 60;

export async function lacakAksi(_sebelumnya: HasilLacak | null, formData: FormData): Promise<HasilLacak> {
  if (!marketplaceAktif()) notFound();

  const mentah = formData.get('resi');
  const resi = typeof mentah === 'string' ? mentah.trim().slice(0, 40) : '';
  if (resi === '') return { jenis: 'kosong' };

  const db = getDb();
  const boleh = await cekBatas(db, `lacak:${await alamatIp()}`, MAKS_PERCOBAAN, JENDELA_DETIK, Date.now());
  if (!boleh) return { jenis: 'dibatasi' };

  const hasil = await lacakByResi(db, resi);
  if (hasil === null) return { jenis: 'tidak-ada' };
  return { jenis: 'ketemu', ...hasil };
}
