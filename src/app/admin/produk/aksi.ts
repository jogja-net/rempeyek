// src/app/admin/produk/aksi.ts
//
// Server action tambah/ubah/hapus produk (Task 8).
//
// Server action adalah endpoint publik: `requireAdmin()` dipanggil PERTAMA,
// dan semua masukan divalidasi ulang di sini (`validasiProduk`).
//
// Urutan yang disengaja: foto diunggah SEBELUM baris database disimpan, dan
// foto lama baru dihapus SETELAH simpan berhasil. Bila simpan gagal, foto yang
// baru diunggah dibuang lagi, jadi tidak ada foto yatim; bila unggah gagal,
// database tidak tersentuh.

'use server';

import { put, del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { dbAdmin, requireAdmin } from '@/lib/admin-sesi';
import { ambilProdukById, hapusProduk, simpanProduk } from '@/lib/produk-repo';
import { validasiProduk } from '@/lib/produk-validasi';
import { buatSlug } from '@/lib/slug';

const EKSTENSI: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Hanya URL milik Vercel Blob yang boleh dihapus; gambar bawaan/lokal dibiarkan. */
function urlBlob(url: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(url);
}

/** Hapus foto dari Blob sebisanya; kegagalan tidak boleh menggagalkan aksi utama. */
async function buangFoto(urls: string[]): Promise<void> {
  const sasaran = urls.filter(urlBlob);
  if (sasaran.length === 0) return;
  try {
    await del(sasaran);
  } catch (galat) {
    console.error('[produk] gagal menghapus foto lama dari Blob:', galat);
  }
}

function penyimpananFotoSiap(): boolean {
  return (
    (process.env.BLOB_READ_WRITE_TOKEN ?? '').trim() !== '' ||
    (process.env.BLOB_STORE_ID ?? '').trim() !== ''
  );
}

function segarkan(): void {
  revalidatePath('/');
  revalidatePath('/produk/[slug]', 'page');
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/produk');
}

export async function simpan(formData: FormData): Promise<void> {
  await requireAdmin();

  // `id` = "baru" untuk produk baru, selain itu angka.
  const idMentah = String(formData.get('id') ?? '');
  if (idMentah !== 'baru' && !/^\d+$/.test(idMentah)) redirect('/admin/produk');
  const id = idMentah === 'baru' ? undefined : Number(idMentah);

  const balik = (galat: string) =>
    `/admin/produk/${idMentah}?galat=${encodeURIComponent(galat)}`;

  const valid = validasiProduk(formData);
  if (!valid.ok) redirect(balik(valid.galat));

  const db = dbAdmin();
  const lama = id === undefined ? null : await ambilProdukById(db, id);
  if (id !== undefined && lama === null) redirect('/admin/produk');

  let urlBaru: string | null = null;
  if (valid.foto !== null) {
    if (!penyimpananFotoSiap()) {
      redirect(balik('Penyimpanan foto belum dikonfigurasi di server ini (BLOB_READ_WRITE_TOKEN kosong).'));
    }
    try {
      const nama = `produk/${buatSlug(valid.data.nama, [])}-${Date.now()}.${EKSTENSI[valid.foto.type]}`;
      const hasil = await put(nama, valid.foto, { access: 'public', contentType: valid.foto.type });
      urlBaru = hasil.url;
    } catch (galat) {
      console.error('[produk] unggah foto gagal:', galat);
      redirect(balik('Unggah foto gagal. Coba lagi, atau simpan tanpa mengganti foto.'));
    }
  }

  try {
    await simpanProduk(
      db,
      {
        ...valid.data,
        gambar: urlBaru !== null ? [urlBaru] : (lama?.gambar ?? []),
        warna_isian: lama?.warna_isian ?? '#9A5B22',
      },
      id,
    );
  } catch (galat) {
    if (urlBaru !== null) await buangFoto([urlBaru]);
    throw galat;
  }

  // Simpan sudah berhasil; baru sekarang foto lama aman dibuang.
  if (urlBaru !== null && lama !== null) await buangFoto(lama.gambar);

  segarkan();
  redirect(`/admin/produk?info=${id === undefined ? 'dibuat' : 'disimpan'}`);
}

export async function hapus(id: number): Promise<void> {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) redirect('/admin/produk');

  const db = dbAdmin();
  const produk = await ambilProdukById(db, id);
  if (produk === null) redirect('/admin/produk');

  const hasil = await hapusProduk(db, id);
  // Diarsipkan = baris tetap ada dan masih tampil di admin, fotonya dipertahankan.
  if (hasil === 'dihapus') await buangFoto(produk.gambar);

  segarkan();
  redirect(`/admin/produk?info=${hasil}`);
}
