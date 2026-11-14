// src/app/admin/login/aksi.ts
//
// Server action login admin.
//
// Tiga hal yang dijaga di sini:
//   1. Pesan galat SELALU umum — tidak memberi tahu apakah username atau kata
//      sandinya yang salah (mencegah penebakan akun).
//   2. Setiap percobaan dihitung lewat `cekBatas` (5 percobaan / 15 menit per
//      IP). Catatan disimpan di database, bukan memori, karena Vercel bisa
//      menjalankan banyak instans.
//   3. Bila konfigurasi server belum diisi, hasilnya "ditolak" — bukan
//      "semua boleh masuk". Kegagalan tertutup, bukan terbuka.

'use server';

import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { buatToken, UMUR_SESI_MS, verifikasiPassword } from '@/lib/admin-auth';
import { ambilSecret, NAMA_COOKIE_SESI } from '@/lib/admin-sesi';
import { getDb } from '@/lib/db/client';
import { migrate } from '@/lib/db/migrate';
import { cekBatas } from '@/lib/laju';
import { marketplaceAktif } from '@/lib/mode';

const MAKS_PERCOBAAN = 5;
const JENDELA_DETIK = 15 * 60;

/** Bandingkan dua teks dengan waktu tetap (panjang digest selalu sama). */
function samaTeks(a: string, b: string): boolean {
  const kiri = createHash('sha256').update(a, 'utf8').digest();
  const kanan = createHash('sha256').update(b, 'utf8').digest();
  return timingSafeEqual(kiri, kanan);
}

/** Alamat IP pemanggil untuk kunci pembatas laju. */
async function alamatIp(): Promise<string> {
  const kepala = await headers();
  const diteruskan = kepala.get('x-forwarded-for') ?? '';
  const pertama = diteruskan.split(',')[0]?.trim() ?? '';
  return pertama === '' ? 'lokal' : pertama;
}

export async function masuk(formData: FormData): Promise<void> {
  if (!marketplaceAktif()) notFound();

  const ip = await alamatIp();
  const db = getDb();
  await migrate(db);

  const boleh = await cekBatas(db, `login:${ip}`, MAKS_PERCOBAAN, JENDELA_DETIK, Date.now());
  if (!boleh) {
    redirect('/admin/login?galat=laju');
  }

  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const adminUser = (process.env.ADMIN_USERNAME ?? '').trim();
  const hashEnv = (process.env.ADMIN_PASSWORD_HASH ?? '').trim();
  const secret = ambilSecret();

  if (adminUser === '' || hashEnv === '' || secret === '') {
    redirect('/admin/login?galat=konfigurasi');
  }

  // Kedua pemeriksaan selalu dijalankan penuh: keluar lebih awal saat username
  // salah akan membuat waktu balasan membocorkan username yang benar.
  const userCocok = samaTeks(username, adminUser);
  const sandiCocok = verifikasiPassword(password, hashEnv);

  if (!userCocok || !sandiCocok) {
    redirect('/admin/login?galat=1');
  }

  const jar = await cookies();
  jar.set(NAMA_COOKIE_SESI, buatToken(secret, Date.now()), {
    httpOnly: true,
    // Lokal memakai http, jadi `secure` hanya di build produksi (di Vercel
    // preview maupun produksi selalu https).
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: Math.floor(UMUR_SESI_MS / 1000),
  });

  redirect('/admin');
}
