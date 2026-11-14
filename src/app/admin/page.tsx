// src/app/admin/page.tsx
//
// Daftar pesanan dengan filter status lewat `?status=`.
// `requireAdmin()` wajib dipanggil di sini, bukan hanya di layout: layout dan
// halaman dirender paralel, jadi penjagaan di layout tidak menjamin halaman.

import type { Metadata } from 'next';

import LencanaStatus from '@/components/LencanaStatus';
import { dbAdmin, requireAdmin } from '@/lib/admin-sesi';
import { formatRupiah, formatWaktuWib } from '@/lib/format';
import { daftarPesanan } from '@/lib/pesanan-repo';
import { LABEL_STATUS, type StatusPesanan } from '@/lib/status';

export const metadata: Metadata = {
  title: 'Pesanan — Panel Admin',
  robots: { index: false, follow: false },
};

type StatusFilter = StatusPesanan | 'kedaluwarsa';

const URUTAN_FILTER: StatusFilter[] = [
  'menunggu_pembayaran',
  'kedaluwarsa',
  'dibayar',
  'dikirim',
  'selesai',
  'batal',
];

function keStatusFilter(nilai: string | undefined): StatusFilter | undefined {
  return URUTAN_FILTER.find((s) => s === nilai);
}

export default async function HalamanPesanan({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  await requireAdmin();

  const { status } = await searchParams;
  const dipilih = keStatusFilter(Array.isArray(status) ? status[0] : status);

  const pesanan = await daftarPesanan(dbAdmin(), dipilih === undefined ? undefined : { status: dipilih });

  const tab = (href: string, teks: string, aktif: boolean) => (
    <a
      key={href}
      href={href}
      aria-current={aktif ? 'page' : undefined}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm ${
        aktif
          ? 'border-kakao bg-kakao text-kertas'
          : 'border-kraft-garis bg-kertas text-redup hover:bg-kraft'
      }`}
    >
      {teks}
    </a>
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-6 font-judul text-3xl font-bold text-kakao">Pesanan</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {tab('/admin', 'Semua', dipilih === undefined)}
        {URUTAN_FILTER.map((s) => tab(`/admin?status=${s}`, LABEL_STATUS[s], dipilih === s))}
      </div>

      {pesanan.length === 0 ? (
        <p className="rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-8 text-center text-redup">
          {dipilih === undefined
            ? 'Belum ada pesanan.'
            : `Tidak ada pesanan berstatus “${LABEL_STATUS[dipilih]}”.`}
        </p>
      ) : (
        <ul className="space-y-3">
          {pesanan.map((p) => (
            <li key={p.id}>
              <a
                href={`/admin/pesanan/${p.id}`}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-5 transition-colors hover:border-cabai"
              >
                <div>
                  <p className="font-semibold text-kakao">{p.nomor}</p>
                  <p className="text-sm text-redup">
                    {p.nama} · {formatWaktuWib(p.dibuat)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-kakao">{formatRupiah(p.total)}</span>
                  <LencanaStatus status={p.status} />
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
