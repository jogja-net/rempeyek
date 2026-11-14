// src/app/admin/aksi.ts
//
// Keluar dari panel admin: hapus cookie sesi. Sesi tidak disimpan di server,
// jadi menghapus cookie sudah cukup untuk perangkat ini.

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { NAMA_COOKIE_SESI } from '@/lib/admin-sesi';

export async function keluar(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: NAMA_COOKIE_SESI, path: '/admin' });
  redirect('/admin/login');
}
