// src/app/admin/produk/page.tsx
//
// Daftar semua produk, termasuk yang diarsipkan (diberi tanda).
// `requireAdmin()` dipanggil sendiri di sini; layout bukan penjaga.

import type { Metadata } from 'next';

import { dbAdmin, requireAdmin } from '@/lib/admin-sesi';
import { formatBerat, formatRupiah } from '@/lib/format';
import { daftarProdukAdmin } from '@/lib/produk-repo';

export const metadata: Metadata = {
  title: 'Produk | Panel Admin',
  robots: { index: false, follow: false },
};

const INFO: Record<string, string> = {
  dibuat: 'Produk baru disimpan.',
  disimpan: 'Perubahan produk disimpan.',
  dihapus: 'Produk dihapus.',
  diarsipkan:
    'Produk sudah pernah dipesan, jadi tidak dihapus melainkan diarsipkan (tidak tampil di katalog).',
};

const LABEL_STATUS = { tersedia: 'Tersedia', po: 'Pre-order', habis: 'Habis' } as const;

export default async function HalamanProduk({
  searchParams,
}: {
  searchParams: Promise<{ info?: string | string[] }>;
}) {
  await requireAdmin();

  const { info } = await searchParams;
  const kunciInfo = Array.isArray(info) ? info[0] : info;
  const pesan = kunciInfo === undefined ? undefined : INFO[kunciInfo];

  const produk = await daftarProdukAdmin(dbAdmin());

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-judul text-3xl font-bold text-kakao">Produk</h1>
        <a
          href="/admin/produk/baru"
          className="rounded-xl bg-cabai px-5 py-3 text-sm font-semibold text-kertas transition-colors hover:bg-cabai-tua"
        >
          Tambah produk
        </a>
      </div>

      {pesan !== undefined && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-kraft-garis bg-kraft px-4 py-3 text-sm text-kakao"
        >
          {pesan}
        </p>
      )}

      {produk.length === 0 ? (
        <p className="rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-8 text-center text-redup">
          Belum ada produk.
        </p>
      ) : (
        <ul className="space-y-3">
          {produk.map((p) => (
            <li key={p.id}>
              <a
                href={`/admin/produk/${p.id}`}
                className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-[var(--radius-kartu)] border border-kraft-garis p-5 transition-colors hover:border-cabai ${
                  p.diarsipkan ? 'bg-kraft/60' : 'bg-kertas'
                }`}
              >
                <div>
                  <p className="font-semibold text-kakao">
                    {p.nama}
                    {p.diarsipkan && (
                      <span className="ml-2 rounded-full bg-kakao px-2 py-0.5 align-middle text-xs font-semibold text-kertas">
                        Diarsipkan
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-redup">
                    {p.kategori === 'sambal' ? 'Sambal' : 'Peyek'} · {formatBerat(p.berat_gram)} ·{' '}
                    {LABEL_STATUS[p.status]}
                    {p.gambar.length === 0 && ' · belum ada foto'}
                  </p>
                </div>
                <span className="font-semibold text-kakao">{formatRupiah(p.harga)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
