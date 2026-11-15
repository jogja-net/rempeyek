// src/lib/admin-sesi.ts
//
// Penjaga gerbang panel admin untuk server component dan server action.
//
// PENTING: `layout.tsx` TIDAK cukup sebagai penjaga. Di Next.js App Router,
// layout dan halaman dirender bersamaan (sering paralel), dan server action
// tidak lewat layout sama sekali. Karena itu SETIAP halaman admin dan SETIAP
// server action admin wajib memanggil `requireAdmin()` sendiri-sendiri.

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { tokenSah } from './admin-auth';
import { getDb } from './db/client';
import { marketplaceAktif } from './mode';

/** Nama cookie sesi. `path: '/admin'` membatasinya ke area admin saja. */
export const NAMA_COOKIE_SESI = 'sesi_admin';

/** Secret dipakai khusus menandatangani token sesi. */
export function ambilSecret(env: NodeJS.ProcessEnv = process.env): string {
  return (env.SESSION_SECRET ?? '').trim();
}

/**
 * Memastikan pemanggil adalah admin yang sudah masuk.
 *
 * Dua penolakan berbeda, dan bedanya disengaja:
 *   - Marketplace mati (produksi, atau database belum diisi) → `notFound()`.
 *     Panel admin tidak boleh mengaku keberadaannya di produksi.
 *   - Marketplace hidup tetapi cookie tidak sah → `redirect('/admin/login')`.
 *
 * Dipanggil dari server component maupun server action. Sengaja tidak
 * mengembalikan apa pun: pemanggil hanya perlu "lanjut atau ditolak".
 */
export async function requireAdmin(): Promise<void> {
  if (!marketplaceAktif()) notFound();

  const secret = ambilSecret();
  if (secret === '') {
    // Salah konfigurasi = tidak ada yang boleh masuk, bukan semua boleh masuk.
    redirect('/admin/login');
  }

  const jar = await cookies();
  const token = jar.get(NAMA_COOKIE_SESI)?.value;

  if (!tokenSah(token, secret, Date.now())) {
    redirect('/admin/login');
  }
}

/**
 * Apakah permintaan ini sudah punya sesi admin yang sah?
 *
 * Dipakai halaman login untuk mengalihkan admin yang sudah masuk; berbeda
 * dari `requireAdmin` yang mengalihkan admin yang BELUM masuk.
 */
export async function sudahMasuk(): Promise<boolean> {
  const secret = ambilSecret();
  if (secret === '') return false;

  const jar = await cookies();
  const token = jar.get(NAMA_COOKIE_SESI)?.value;
  return tokenSah(token, secret, Date.now());
}

/** Klien database untuk area admin. Melempar bila TURSO_DATABASE_URL kosong. */
export function dbAdmin() {
  return getDb();
}
