// src/app/admin/produk/[id]/page.tsx
//
// Formulir tambah (`id` = "baru") dan ubah produk. `requireAdmin()` dipanggil
// sendiri di sini; layout bukan penjaga.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import TombolAksi from '@/components/TombolAksi';
import { dbAdmin, requireAdmin } from '@/lib/admin-sesi';
import { ambilProdukById, type ProdukDb } from '@/lib/produk-repo';

import { hapus, simpan } from '../aksi';

export const metadata: Metadata = {
  title: 'Ubah Produk — Panel Admin',
  robots: { index: false, follow: false },
};

const KOLOM =
  'w-full rounded-xl border border-kraft-garis bg-krem px-4 py-3 text-kakao outline-none focus:border-cabai';

export default async function HalamanFormProduk({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ galat?: string | string[] }>;
}) {
  await requireAdmin();

  const { id: idTeks } = await params;
  const baru = idTeks === 'baru';
  if (!baru && !/^\d+$/.test(idTeks)) notFound();

  let produk: ProdukDb | null = null;
  if (!baru) {
    produk = await ambilProdukById(dbAdmin(), Number(idTeks));
    if (produk === null) notFound();
  }

  const { galat } = await searchParams;
  const pesanGalat = (Array.isArray(galat) ? galat[0] : galat)?.slice(0, 200);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <a href="/admin/produk" className="mb-4 inline-block text-sm text-redup underline underline-offset-4">
        ← Semua produk
      </a>
      <h1 className="mb-6 font-judul text-3xl font-bold text-kakao">
        {baru ? 'Tambah produk' : 'Ubah produk'}
      </h1>

      {pesanGalat !== undefined && pesanGalat !== '' && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-cabai/30 bg-cabai/10 px-4 py-3 text-sm text-cabai-tua"
        >
          {pesanGalat}
        </p>
      )}

      <form
        action={simpan}
        className="space-y-5 rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-6"
      >
        <input type="hidden" name="id" value={idTeks} />

        <div>
          <label htmlFor="nama" className="mb-1 block text-sm font-medium text-kakao">
            Nama produk
          </label>
          <input
            id="nama"
            name="nama"
            required
            minLength={2}
            maxLength={80}
            defaultValue={produk?.nama ?? ''}
            className={KOLOM}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="kategori" className="mb-1 block text-sm font-medium text-kakao">
              Kategori
            </label>
            <select id="kategori" name="kategori" defaultValue={produk?.kategori ?? 'rempeyek'} className={KOLOM}>
              <option value="rempeyek">Rempeyek</option>
              <option value="sambal">Sambal</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-kakao">
              Status
            </label>
            <select id="status" name="status" defaultValue={produk?.status ?? 'tersedia'} className={KOLOM}>
              <option value="tersedia">Tersedia</option>
              <option value="po">Pre-order</option>
              <option value="habis">Habis</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="deskripsi" className="mb-1 block text-sm font-medium text-kakao">
            Deskripsi
          </label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            rows={4}
            maxLength={1000}
            defaultValue={produk?.deskripsi ?? ''}
            className={KOLOM}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="harga" className="mb-1 block text-sm font-medium text-kakao">
              Harga (Rp)
            </label>
            <input
              id="harga"
              name="harga"
              type="number"
              inputMode="numeric"
              required
              min={0}
              max={10000000}
              step={1}
              defaultValue={produk?.harga ?? ''}
              className={KOLOM}
            />
          </div>
          <div>
            <label htmlFor="berat" className="mb-1 block text-sm font-medium text-kakao">
              Berat kemasan (gram)
            </label>
            <input
              id="berat"
              name="berat"
              type="number"
              inputMode="numeric"
              required
              min={1}
              max={50000}
              step={1}
              defaultValue={produk?.berat_gram ?? ''}
              className={KOLOM}
            />
          </div>
        </div>

        <div>
          <label htmlFor="foto" className="mb-1 block text-sm font-medium text-kakao">
            Foto produk
          </label>
          {produk !== null && produk.gambar.length > 0 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={produk.gambar[0]}
              alt={`Foto ${produk.nama} saat ini`}
              className="mb-3 h-32 w-32 rounded-xl border border-kraft-garis object-cover"
            />
          )}
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-sm text-redup file:mr-4 file:rounded-xl file:border-0 file:bg-kraft file:px-4 file:py-2 file:font-semibold file:text-kakao"
          />
          <p className="mt-1 text-xs text-redup">
            JPEG, PNG, atau WebP, maksimal 4 MB.
            {produk !== null && produk.gambar.length > 0 && ' Kosongkan untuk mempertahankan foto saat ini.'}
          </p>
        </div>

        <TombolAksi>Simpan</TombolAksi>
      </form>

      {produk !== null && !produk.diarsipkan && (
        <form action={hapus.bind(null, produk.id)} className="mt-8">
          <p className="mb-2 text-sm text-redup">
            Produk yang belum pernah dipesan dihapus permanen. Yang sudah pernah dipesan hanya
            diarsipkan, supaya laporan tetap utuh.
          </p>
          <TombolAksi
            gaya="bahaya"
            konfirmasi="Hapus produk ini? Bila belum pernah dipesan, produk hilang permanen."
          >
            Hapus produk
          </TombolAksi>
        </form>
      )}
    </main>
  );
}
