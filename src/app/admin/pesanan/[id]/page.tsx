// src/app/admin/pesanan/[id]/page.tsx
//
// Detail pesanan + tombol aksi sesuai status. `requireAdmin()` dipanggil
// sendiri di sini (layout tidak cukup).

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import LencanaStatus from '@/components/LencanaStatus';
import TombolAksi from '@/components/TombolAksi';
import { dbAdmin, requireAdmin } from '@/lib/admin-sesi';
import { formatBerat, formatRupiah, formatWaktuWib } from '@/lib/format';
import { hitungBeratTotal } from '@/lib/hitung';
import { ambilPesanan } from '@/lib/pesanan-repo';
import { statusTampil } from '@/lib/status';

import { ubahStatus } from './aksi';

export const metadata: Metadata = {
  title: 'Detail Pesanan | Panel Admin',
  robots: { index: false, follow: false },
};

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 py-1.5 text-sm">
      <dt className="text-redup">{label}</dt>
      <dd className="text-kakao">{children}</dd>
    </div>
  );
}

export default async function HalamanDetailPesanan({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ galat?: string | string[] }>;
}) {
  await requireAdmin();

  const { id: idTeks } = await params;
  if (!/^\d+$/.test(idTeks)) notFound();
  const id = Number(idTeks);

  const pesanan = await ambilPesanan(dbAdmin(), id);
  if (pesanan === null) notFound();

  const { galat } = await searchParams;
  const pesanGalat = (Array.isArray(galat) ? galat[0] : galat)?.slice(0, 200);

  const tampil = statusTampil(pesanan, new Date());
  const bisaResi = pesanan.status === 'dikirim' || pesanan.status === 'selesai';

  const aksi = (
    kode: 'dibayar' | 'batal' | 'kirim' | 'selesai',
    teks: string,
    gaya: 'utama' | 'netral' | 'bahaya' = 'utama',
    konfirmasi?: string,
  ) => (
    <form key={kode} action={ubahStatus.bind(null, pesanan.id, kode)}>
      <TombolAksi gaya={gaya} konfirmasi={konfirmasi}>
        {teks}
      </TombolAksi>
    </form>
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <a href="/admin" className="mb-4 inline-block text-sm text-redup underline underline-offset-4">
        ← Semua pesanan
      </a>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-judul text-3xl font-bold text-kakao">{pesanan.nomor}</h1>
        <LencanaStatus status={tampil} />
      </div>

      {pesanGalat !== undefined && pesanGalat !== '' && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-cabai/30 bg-cabai/10 px-4 py-3 text-sm text-cabai-tua"
        >
          Aksi tidak dijalankan: {pesanGalat}.
        </p>
      )}

      <section className="mb-6 rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-6">
        <h2 className="mb-2 font-judul text-lg font-bold text-kakao">Pembeli</h2>
        <dl>
          <Baris label="Nama">{pesanan.nama}</Baris>
          <Baris label="HP">{pesanan.hp}</Baris>
          <Baris label="Alamat">{pesanan.alamat}</Baris>
          <Baris label="Kota / provinsi">
            {pesanan.kota}, {pesanan.provinsi}
          </Baris>
        </dl>
      </section>

      <section className="mb-6 rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-6">
        <h2 className="mb-2 font-judul text-lg font-bold text-kakao">Pengiriman</h2>
        <dl>
          <Baris label="Kurir">
            {pesanan.kurir}, {pesanan.layanan}
          </Baris>
          <Baris label="Berat">{formatBerat(hitungBeratTotal(pesanan.items))}</Baris>
          <Baris label="Nomor resi">{pesanan.resi ?? '-'}</Baris>
          <Baris label="Dibuat">{formatWaktuWib(pesanan.dibuat)}</Baris>
          {pesanan.dibayarPada !== null && (
            <Baris label="Dibayar">{formatWaktuWib(pesanan.dibayarPada)}</Baris>
          )}
          {pesanan.dikirimPada !== null && (
            <Baris label="Dikirim">{formatWaktuWib(pesanan.dikirimPada)}</Baris>
          )}
          {pesanan.selesaiPada !== null && (
            <Baris label="Selesai">{formatWaktuWib(pesanan.selesaiPada)}</Baris>
          )}
          {pesanan.dibatalkanPada !== null && (
            <Baris label="Dibatalkan">{formatWaktuWib(pesanan.dibatalkanPada)}</Baris>
          )}
        </dl>
      </section>

      <section className="mb-6 rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-6">
        <h2 className="mb-3 font-judul text-lg font-bold text-kakao">Isi pesanan</h2>
        <ul className="divide-y divide-kraft-garis text-sm">
          {pesanan.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-2">
              <span className="text-kakao">
                {i.nama} <span className="text-redup">× {i.jumlah}</span>
              </span>
              <span className="text-kakao">{formatRupiah(i.harga * i.jumlah)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-kraft-garis pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-redup">Subtotal</dt>
            <dd className="text-kakao">{formatRupiah(pesanan.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-redup">Ongkir</dt>
            <dd className="text-kakao">{formatRupiah(pesanan.ongkir)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt className="text-kakao">Total</dt>
            <dd className="text-kakao">{formatRupiah(pesanan.total)}</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        {pesanan.status === 'menunggu_pembayaran' && [
          aksi('dibayar', 'Sudah dibayar'),
          aksi('batal', 'Batalkan', 'bahaya', 'Batalkan pesanan ini? Tindakan ini tidak bisa diurungkan.'),
        ]}
        {pesanan.status === 'dibayar' && [
          aksi('kirim', 'Buat resi dan tandai dikirim'),
          aksi('batal', 'Batalkan', 'bahaya', 'Batalkan pesanan ini? Tindakan ini tidak bisa diurungkan.'),
        ]}
        {pesanan.status === 'dikirim' && aksi('selesai', 'Tandai selesai')}
        {bisaResi && (
          <a
            href={`/admin/pesanan/${pesanan.id}/resi`}
            className="rounded-xl border border-kraft-garis bg-kertas px-5 py-3 text-sm font-semibold text-kakao transition-colors hover:bg-kraft"
          >
            Lihat dan cetak resi
          </a>
        )}
      </div>
    </main>
  );
}
