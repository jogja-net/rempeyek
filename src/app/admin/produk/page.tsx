// src/app/admin/produk/page.tsx
//
// Daftar semua produk, termasuk yang diarsipkan (diberi tanda).
// `requireAdmin()` dipanggil sendiri di sini; layout bukan penjaga.

import type { Metadata } from 'next';

import JudulHalaman from '@/components/admin/JudulHalaman';
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
    <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
      <JudulHalaman judul="Produk" deskripsi="Atur harga, status, dan foto. Produk yang sudah pernah dipesan hanya diarsipkan.">
        <a
          href="/admin/produk/baru"
          className="rounded-[10px] bg-cabai px-5 py-2.5 text-sm font-semibold text-kertas transition-colors duration-150 hover:bg-cabai-tua"
        >
          Tambah produk
        </a>
      </JudulHalaman>

      {pesan !== undefined && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-kraft-garis bg-kraft px-4 py-3 text-sm text-kakao"
        >
          {pesan}
        </p>
      )}

      {produk.length === 0 ? (
        <p className="rounded-2xl border border-kraft-garis bg-kertas p-8 text-center text-redup">
          Belum ada produk.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-kraft-garis bg-kertas">
          <table className="w-full text-sm tabular-nums max-md:block">
            <thead className="bg-kraft/30 text-xs max-md:hidden">
              <tr className="border-b border-kraft-garis text-left text-redup">
                <th className="px-5 py-2.5 font-semibold">Produk</th>
                <th className="px-5 py-2.5 font-semibold">Kategori</th>
                <th className="px-5 py-2.5 font-semibold">Berat</th>
                <th className="px-5 py-2.5 text-right font-semibold">Harga</th>
                <th className="px-5 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="max-md:block">
              {produk.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-kraft-garis last:border-0 hover:bg-kraft/30 max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-1 max-md:px-4 max-md:py-3 ${p.diarsipkan ? 'bg-kraft/40' : ''}`}
                >
                  <td className="px-5 py-3 max-md:p-0 max-md:order-1 max-md:basis-full">
                    <a href={`/admin/produk/${p.id}`} className="flex items-center gap-3">
                      {p.gambar.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.gambar[0]} alt="" className="h-11 w-11 rounded-lg border border-kraft-garis object-cover" />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-kraft-titik text-xs text-redup"
                        >
                          foto
                        </span>
                      )}
                      <span className="font-semibold text-kakao underline-offset-4 hover:underline">{p.nama}</span>
                    </a>
                  </td>
                  <td className="px-5 py-3 text-redup max-md:p-0 max-md:order-2 max-md:text-xs">{p.kategori === 'sambal' ? 'Sambal' : 'Peyek'}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-redup max-md:p-0 max-md:order-3 max-md:flex-1 max-md:text-xs">{formatBerat(p.berat_gram)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-kakao max-md:p-0 max-md:order-4">{formatRupiah(p.harga)}</td>
                  <td className="px-5 py-3 max-md:p-0 max-md:order-5">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                        p.diarsipkan
                          ? 'bg-kakao text-kertas'
                          : p.status === 'tersedia'
                            ? 'bg-emas/30 text-kakao'
                            : 'bg-kraft text-redup'
                      }`}
                    >
                      {p.diarsipkan ? 'Diarsipkan' : LABEL_STATUS[p.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
