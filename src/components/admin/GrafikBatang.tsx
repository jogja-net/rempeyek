// Grafik batang omzet murni CSS (tanpa pustaka). Dipakai dashboard dan laporan.
// ponytail: batang proporsional terhadap nilai terbesar; tanpa sumbu/skala, cukup untuk gambaran tren.

import { formatRupiah } from '@/lib/format';

export type TitikGrafik = { label: string; nilai: number };

export default function GrafikBatang({ data }: { data: TitikGrafik[] }) {
  const maks = Math.max(1, ...data.map((d) => d.nilai));
  const total = data.reduce((j, d) => j + d.nilai, 0);

  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label={`Grafik omzet, total ${formatRupiah(total)} dalam ${data.length} titik`}
        className="flex h-40 items-end gap-1"
      >
        {data.map((d) => (
          <div
            key={d.label}
            title={`${d.label}: ${formatRupiah(d.nilai)}`}
            className="flex h-full min-w-0 flex-1 items-end"
          >
            <div
              className={`w-full rounded-t ${d.nilai > 0 ? 'bg-emas' : 'bg-kraft'}`}
              style={{ height: `${d.nilai > 0 ? Math.max(4, (d.nilai / maks) * 100) : 2}%` }}
            />
          </div>
        ))}
      </div>
      {data.length > 0 && (
        <figcaption className="mt-2 flex justify-between text-xs text-redup">
          <span>{data[0].label}</span>
          <span>{data[data.length - 1].label}</span>
        </figcaption>
      )}
    </figure>
  );
}
