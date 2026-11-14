'use client';

// src/app/checkout/FormCheckout.tsx
//
// Formulir checkout. Dikirim lewat `startTransition` (bukan `<form action>`)
// supaya isian TIDAK dikosongkan saat server menolak: React 19 mereset
// formulir setelah sebuah form action selesai, sedangkan di sini formulir
// tidak pernah di-reset. Sukses = server memanggil `redirect()`.

import { useEffect, useRef, useState, useTransition } from 'react';

import { useKeranjang } from '@/components/KeranjangProvider';
import { formatRupiah } from '@/lib/format';
import { ringkasKeranjang, type ProdukToko } from '@/lib/keranjang';
import type { OpsiOngkir } from '@/lib/ongkir';

import { buatPesananAksi, opsiOngkirAksi } from './aksi';

const KOLOM =
  'w-full rounded-xl border border-kraft-garis bg-krem px-4 py-3 text-kakao outline-none focus:border-cabai';
const KARTU = 'rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-6';

export default function FormCheckout({
  katalog,
  daftarProvinsi,
}: {
  katalog: ProdukToko[];
  daftarProvinsi: string[];
}) {
  const { items, siap } = useKeranjang();
  const [provinsi, setProvinsi] = useState('');
  const [opsi, setOpsi] = useState<OpsiOngkir[]>([]);
  const [kodeOngkir, setKodeOngkir] = useState('');
  const [galatOngkir, setGalatOngkir] = useState<string | null>(null);
  const [memuatOngkir, setMemuatOngkir] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [mengirim, mulaiKirim] = useTransition();
  const sedangKirim = useRef(false);

  const ringkas = ringkasKeranjang(items, katalog);
  const bisaDipesan = siap && items.length > 0 && !ringkas.adaMasalah;
  const kunciItems = JSON.stringify(items);

  // Hitung ulang opsi ongkir (di server) saat provinsi atau isi keranjang berubah.
  useEffect(() => {
    setOpsi([]);
    setKodeOngkir('');
    setGalatOngkir(null);
    if (!bisaDipesan || provinsi === '') return;

    let batal = false;
    setMemuatOngkir(true);
    opsiOngkirAksi(kunciItems, provinsi)
      .then((hasil) => {
        if (batal) return;
        if (hasil.ok) {
          setOpsi(hasil.opsi);
          setKodeOngkir(hasil.opsi.find((o) => o.kode === 'reguler')?.kode ?? hasil.opsi[0]?.kode ?? '');
        } else {
          setGalatOngkir(hasil.galat);
        }
      })
      .catch(() => {
        if (!batal) setGalatOngkir('Gagal menghitung ongkir. Coba lagi.');
      })
      .finally(() => {
        if (!batal) setMemuatOngkir(false);
      });

    return () => {
      batal = true;
    };
  }, [provinsi, kunciItems, bisaDipesan]);

  if (!siap) return <p className="text-redup">Memuat…</p>;

  if (items.length === 0) {
    return (
      <div className={`${KARTU} text-center`}>
        <p className="mb-4 text-redup">Keranjang masih kosong.</p>
        <a href="/#varian" className="font-bold text-cabai underline underline-offset-4">
          Lihat produk
        </a>
      </div>
    );
  }

  if (ringkas.adaMasalah) {
    return (
      <div role="alert" className="rounded-xl border border-cabai/30 bg-cabai/10 px-5 py-4 text-cabai-tua">
        <p className="mb-2">Ada produk di keranjang yang sudah tidak tersedia, jadi pesanan belum bisa dibuat.</p>
        <a href="/keranjang" className="font-bold underline underline-offset-4">
          Kembali ke keranjang untuk menghapusnya
        </a>
      </div>
    );
  }

  const opsiTerpilih = opsi.find((o) => o.kode === kodeOngkir) ?? null;
  const total = ringkas.subtotal + (opsiTerpilih?.tarif ?? 0);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (sedangKirim.current) return;
        if (opsiTerpilih === null) {
          setGalat('Pilih provinsi dan metode pengiriman dulu.');
          return;
        }

        const fd = new FormData(e.currentTarget);
        fd.set('provinsi', provinsi);
        fd.set('kodeOngkir', kodeOngkir);
        fd.set('items', kunciItems);

        setGalat(null);
        sedangKirim.current = true;
        mulaiKirim(async () => {
          try {
            const hasil = await buatPesananAksi(fd);
            // Sukses → server memanggil redirect(), kode di bawah tidak tercapai.
            if (hasil) setGalat(hasil.galat);
          } finally {
            sedangKirim.current = false;
          }
        });
      }}
    >
      <section className={KARTU}>
        <h2 className="mb-4 font-judul text-lg font-bold text-kakao">Data penerima</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="nama" className="mb-1 block text-sm font-medium text-kakao">
              Nama lengkap
            </label>
            <input id="nama" name="nama" required minLength={2} maxLength={80} autoComplete="name" className={KOLOM} />
          </div>
          <div>
            <label htmlFor="hp" className="mb-1 block text-sm font-medium text-kakao">
              Nomor HP / WhatsApp
            </label>
            <input
              id="hp"
              name="hp"
              type="tel"
              inputMode="tel"
              required
              maxLength={20}
              autoComplete="tel"
              placeholder="0812-3456-7890"
              className={KOLOM}
            />
          </div>
          <div>
            <label htmlFor="alamat" className="mb-1 block text-sm font-medium text-kakao">
              Alamat lengkap
            </label>
            <textarea
              id="alamat"
              name="alamat"
              required
              minLength={10}
              maxLength={300}
              rows={3}
              autoComplete="street-address"
              className={KOLOM}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="provinsi" className="mb-1 block text-sm font-medium text-kakao">
                Provinsi
              </label>
              <select
                id="provinsi"
                required
                value={provinsi}
                onChange={(e) => setProvinsi(e.target.value)}
                className={KOLOM}
              >
                <option value="">Pilih provinsi…</option>
                {daftarProvinsi.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="kota" className="mb-1 block text-sm font-medium text-kakao">
                Kota / kabupaten
              </label>
              <input id="kota" name="kota" required maxLength={80} className={KOLOM} />
            </div>
          </div>
        </div>
      </section>

      <section className={KARTU}>
        <h2 className="mb-4 font-judul text-lg font-bold text-kakao">Pengiriman</h2>
        {provinsi === '' ? (
          <p className="text-sm text-redup">Pilih provinsi untuk melihat ongkir.</p>
        ) : memuatOngkir ? (
          <p className="text-sm text-redup">Menghitung ongkir…</p>
        ) : galatOngkir !== null ? (
          <p role="alert" className="text-sm text-cabai-tua">
            {galatOngkir}
          </p>
        ) : (
          <fieldset className="space-y-2">
            <legend className="sr-only">Pilih metode pengiriman</legend>
            {opsi.map((o) => (
              <label
                key={o.kode}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 ${
                  o.kode === kodeOngkir ? 'border-cabai bg-cabai/5' : 'border-kraft-garis'
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="opsi-ongkir"
                    value={o.kode}
                    checked={o.kode === kodeOngkir}
                    onChange={() => setKodeOngkir(o.kode)}
                  />
                  <span>
                    <span className="block font-semibold capitalize text-kakao">
                      {o.kurir} — {o.kode}
                    </span>
                    <span className="block text-sm text-redup">Estimasi {o.estimasi}</span>
                  </span>
                </span>
                <span className="font-bold text-kakao">{formatRupiah(o.tarif)}</span>
              </label>
            ))}
          </fieldset>
        )}
      </section>

      <section className={KARTU}>
        <h2 className="mb-3 font-judul text-lg font-bold text-kakao">Ringkasan</h2>
        <ul className="mb-4 divide-y divide-kraft-garis text-sm">
          {ringkas.baris.map((b) => (
            <li key={b.produkId} className="flex justify-between gap-4 py-2">
              <span className="text-kakao">
                {b.produk?.nama} <span className="text-redup">× {b.jumlah}</span>
              </span>
              <span className="text-kakao">{formatRupiah(b.subtotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1 border-t border-kraft-garis pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-redup">Subtotal</dt>
            <dd className="text-kakao">{formatRupiah(ringkas.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-redup">Ongkir</dt>
            <dd className="text-kakao">{opsiTerpilih === null ? '-' : formatRupiah(opsiTerpilih.tarif)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt className="text-kakao">Total</dt>
            <dd className="text-kakao">{opsiTerpilih === null ? formatRupiah(ringkas.subtotal) : formatRupiah(total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-redup">
          Total final dihitung ulang oleh server. Pembayaran lewat transfer; rekening tampil setelah pesanan dibuat.
        </p>
      </section>

      {galat !== null && (
        <p role="alert" className="rounded-xl border border-cabai/30 bg-cabai/10 px-4 py-3 text-sm text-cabai-tua">
          {galat}
        </p>
      )}

      <button
        type="submit"
        disabled={mengirim || opsiTerpilih === null}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-cabai px-6 font-bold text-white hover:bg-cabai-tua disabled:cursor-not-allowed disabled:bg-kraft disabled:text-redup"
      >
        {mengirim ? 'Membuat pesanan…' : 'Buat pesanan'}
      </button>
    </form>
  );
}
