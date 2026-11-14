// src/app/admin/pesanan/[id]/aksi.ts
//
// Server action perubahan status pesanan.
//
// Server action adalah endpoint publik: argumennya datang dari browser dan
// bisa dipalsukan, bahkan yang di-`bind`. Karena itu `requireAdmin()` dipanggil
// PERTAMA dan `id` serta `aksi` divalidasi ulang di sini.

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireAdmin, dbAdmin } from '@/lib/admin-sesi';
import {
  batalkan,
  kirimDenganResi,
  tandaiDibayar,
  tandaiSelesai,
  type Hasil,
} from '@/lib/pesanan-repo';

export type AksiStatus = 'dibayar' | 'batal' | 'kirim' | 'selesai';

const AKSI_SAH: readonly string[] = ['dibayar', 'batal', 'kirim', 'selesai'];

export async function ubahStatus(id: number, aksi: AksiStatus): Promise<void> {
  await requireAdmin();

  if (!Number.isInteger(id) || id <= 0 || !AKSI_SAH.includes(aksi)) {
    redirect('/admin');
  }

  const db = dbAdmin();
  let hasil: Hasil<unknown>;
  switch (aksi) {
    case 'dibayar':
      hasil = await tandaiDibayar(db, id);
      break;
    case 'batal':
      hasil = await batalkan(db, id);
      break;
    case 'kirim':
      hasil = await kirimDenganResi(db, id);
      break;
    case 'selesai':
      hasil = await tandaiSelesai(db, id);
      break;
  }

  revalidatePath('/admin');
  revalidatePath(`/admin/pesanan/${id}`);

  if (!hasil.ok) {
    // Pesan galat repositori berupa kalimat tetap (bukan masukan pemakai).
    redirect(`/admin/pesanan/${id}?galat=${encodeURIComponent(hasil.galat)}`);
  }
  redirect(`/admin/pesanan/${id}`);
}
