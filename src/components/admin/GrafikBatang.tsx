// Grafik batang omzet murni CSS (tanpa pustaka). Dipakai dashboard dan laporan.
// ponytail: batang proporsional terhadap nilai terbesar; tanpa sumbu/skala, cukup untuk gambaran tren.

import { formatRupiah } from '@/lib/format';

export type TitikGrafik = { label: string; nilai: number };

export default function GrafikBatang({ data, gelap = false }: { data: TitikGrafik[]; gelap?: boolean }) {
  const maks = Math.max(1, ...data.map((d) => d.nilai));
  const total = data.reduce((j, d) => j + d.nilai, 0);
  const tertinggi = data.reduce<TitikGrafik | null>((t, d) => (d.nilai > (t?.nilai ?? 0) ? d : t), null);

  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label={`Grafik omzet, total ${formatRupiah(total)} dalam ${data.length} titik`}
        className="flex h-36 items-end gap-1.5"
      >
        {data.map((d) => (
          <div
            key={d.label}
            title={`${d.label}: ${formatRupiah(d.nilai)}`}
            className="flex h-full min-w-0 flex-1 items-end"
          >
            <div
              className={`w-full rounded-t-[4px] transition-opacity duration-150 hover:opacity-80 ${
                d.nilai > 0 ? 'bg-emas' : gelap ? 'bg-kertas/10' : 'bg-kraft'
              }`}
              style={{ height: `${d.nilai > 0 ? Math.max(5, (d.nilai / maks) * 100) : 3}%` }}
            />
          </div>
        ))}
      </div>
      {data.length > 0 && (
        <figcaption className={`mt-2 flex justify-between text-xs ${gelap ? 'text-redup-terang' : 'text-redup'}`}>
          <span>{data[0].label}</span>
          {tertinggi !== null && <span>Tertinggi {formatRupiah(tertinggi.nilai)} ({tertinggi.label})</span>}
          <span>{data[data.length - 1].label}</span>
        </figcaption>
      )}
    </figure>
  );
}
