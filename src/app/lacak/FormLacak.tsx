'use client';

// src/app/lacak/FormLacak.tsx — formulir dan hasil pelacakan resi.

import { useActionState } from 'react';

import LencanaStatus from '@/components/LencanaStatus';
import { formatWaktuWib } from '@/lib/format';

import { lacakAksi, type HasilLacak } from './aksi';

export default function FormLacak() {
  const [hasil, aksi, memproses] = useActionState<HasilLacak | null, FormData>(lacakAksi, null);

  return (
    <div>
      <form
        action={aksi}
        className="mb-6 rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-6"
      >
        <label htmlFor="resi" className="mb-1 block text-isi font-medium text-kakao">
          Nomor resi
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="resi"
            name="resi"
            required
            maxLength={40}
            autoComplete="off"
            placeholder="DEMO-XXXXXXXX"
            className="min-w-0 flex-1 rounded-xl border border-kraft-garis bg-krem px-4 py-3 text-kakao outline-none focus:border-cabai"
          />
          <button
            type="submit"
            disabled={memproses}
            className="inline-flex min-h-12 items-center rounded-full bg-cabai px-6 font-bold text-white hover:bg-cabai-tua disabled:opacity-60"
          >
            {memproses ? 'Mencari…' : 'Lacak'}
          </button>
        </div>
      </form>

      <div aria-live="polite">
        {hasil?.jenis === 'ketemu' && (
          <section className="rounded-[var(--radius-kartu)] border border-kraft-garis bg-kertas p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="font-mono text-kartu font-bold text-kakao">{hasil.resi}</h2>
              <LencanaStatus status={hasil.status} />
            </div>
            <dl className="mb-4 space-y-1 text-isi">
              <div className="flex justify-between gap-4">
                <dt className="text-redup">Kurir</dt>
                <dd className="text-kakao">{hasil.kurir}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-redup">Dikirim</dt>
                <dd className="text-kakao">{formatWaktuWib(hasil.dikirimPada)}</dd>
              </div>
            </dl>
            <h3 className="mb-1 text-isi font-semibold text-kakao">Isi paket</h3>
            <ul className="text-isi text-kakao">
              {hasil.ringkasan.map((r) => (
                <li key={r.nama}>
                  {r.nama} × {r.jumlah}
                </li>
              ))}
            </ul>
          </section>
        )}
        {hasil?.jenis === 'tidak-ada' && (
          <p className="rounded-xl border border-kraft-garis bg-kraft px-4 py-3 text-isi text-kakao">
            Nomor resi tidak ditemukan. Periksa lagi penulisannya.
          </p>
        )}
        {hasil?.jenis === 'dibatasi' && (
          <p role="alert" className="rounded-xl border border-cabai/30 bg-cabai/10 px-4 py-3 text-isi text-cabai-tua">
            Terlalu banyak percobaan. Coba lagi nanti.
          </p>
        )}
        {hasil?.jenis === 'kosong' && (
          <p className="rounded-xl border border-kraft-garis bg-kraft px-4 py-3 text-isi text-kakao">
            Masukkan nomor resi dulu.
          </p>
        )}
      </div>
    </div>
  );
}
