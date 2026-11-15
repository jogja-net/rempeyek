// src/lib/ip.ts
//
// Alamat IP pemanggil untuk kunci pembatas laju (`cekBatas`). Dipakai login
// admin, checkout, dan lacak pesanan.
//
// Di Vercel, `x-forwarded-for` diisi platform dan entri pertamanya adalah IP
// klien. Di lokal header ini kosong, jadi dipakai `'lokal'`.

import { headers } from 'next/headers';

export async function alamatIp(): Promise<string> {
  const kepala = await headers();
  const diteruskan = kepala.get('x-forwarded-for') ?? '';
  const pertama = diteruskan.split(',')[0]?.trim() ?? '';
  return pertama === '' ? 'lokal' : pertama;
}
