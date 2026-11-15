'use client';

// src/app/keranjang/IsiKeranjang.tsx
//
// Isi keranjang: ubah jumlah, hapus, dan lanjut ke checkout. Item yang sudah
// tidak tersedia (diarsipkan, dihapus, atau habis) ditandai jelas dan harus
// dibuang dulu sebelum checkout.

import { useKeranjang } from '@/components/KeranjangProvider';
import { formatRupiah } from '@/lib/format';
import { ringkasKeranjang, type ProdukToko } from '@/lib/keranjang';

const TOMBOL_JUMLAH =
  'inline-flex h-10 w-10 items-center justify-center rounded-full border border-kraft-garis bg-kertas text-lg font-bold text-kakao hover:bg-kraft disabled:opacity-40';

export default function IsiKeranjang({ katalog }: { katalog: ProdukToko[] }) {
  const { items, siap, ubahJumlah } = useKeranjang();

  if (!siap) {
    return <p className="text-redup">Memuat keranjang…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-8 text-center">
        <p className="mb-4 text-redup">Keranjang masih kosong.</p>
        <a
          href="/#varian"
          className="inline-flex min-h-11 items-center rounded-full bg-cabai px-6 font-bold text-white no-underline hover:bg-cabai-tua"
        >
          Lihat produk
        </a>
      </div>
    );
  }

  const ringkas = ringkasKeranjang(items, katalog);

  return (
    <div>
      {ringkas.adaMasalah && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-cabai/30 bg-cabai/10 px-4 py-3 text-sm text-cabai-tua"
        >
          Ada produk yang sudah tidak tersedia. Hapus dulu dari keranjang sebelum melanjutkan.
        </p>
      )}

      <ul className="mb-6 space-y-3">
        {ringkas.baris.map((b) => (
          <li
            key={b.produkId}
            className={`rounded-[var(--radius-kartu)] border border-kraft-garis p-5 ${b.tersedia ? 'bg-kertas' : 'bg-kraft/60'}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold text-kakao">{b.produk?.nama ?? 'Produk tidak ditemukan'}</p>
                {b.tersedia && b.produk ? (
                  <p className="text-sm text-redup">
                    {formatRupiah(b.produk.harga)}
                    {b.produk.status === 'po' && ' · Pre-order'}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-cabai-tua">
                    {b.produk === null ? 'Tidak tersedia lagi' : 'Sedang habis'}
                  </p>
                )}
              </div>
              {b.tersedia && <p className="font-bold text-kakao">{formatRupiah(b.subtotal)}</p>}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              {b.tersedia ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className={TOMBOL_JUMLAH}
                    aria-label={`Kurangi ${b.produk?.nama ?? 'produk'}`}
                    disabled={b.jumlah <= 1}
                    onClick={() => ubahJumlah(b.produkId, b.jumlah - 1)}
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center font-semibold" aria-live="polite">
                    {b.jumlah}
                  </span>
                  <button
                    type="button"
                    className={TOMBOL_JUMLAH}
                    aria-label={`Tambah ${b.produk?.nama ?? 'produk'}`}
                    disabled={b.jumlah >= 99}
                    onClick={() => ubahJumlah(b.produkId, b.jumlah + 1)}
                  >
                    +
                  </button>
                </div>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="text-sm text-redup underline underline-offset-4 hover:text-cabai-tua"
                onClick={() => ubahJumlah(b.produkId, 0)}
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-5">
        <div className="mb-1 flex justify-between text-kakao">
          <span>Subtotal</span>
          <span className="text-lg font-bold">{formatRupiah(ringkas.subtotal)}</span>
        </div>
        <p className="mb-4 text-sm text-redup">Ongkir dihitung di langkah berikutnya.</p>

        {ringkas.adaMasalah || ringkas.subtotal === 0 ? (
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full bg-kraft px-6 font-bold text-redup"
          >
            Lanjut ke checkout
          </span>
        ) : (
          <a
            href="/checkout"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-cabai px-6 font-bold text-white no-underline hover:bg-cabai-tua"
          >
            Lanjut ke checkout
          </a>
        )}
      </div>
    </div>
  );
}
