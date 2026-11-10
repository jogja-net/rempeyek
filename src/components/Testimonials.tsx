import { testimoni } from '@/data/testimoni';

// Section Testimoni (HANDOFF §7.8).
//
// Aturan:
//  - Kalau array `testimoni` kosong → seluruh section TIDAK dirender.
//  - Entri dengan `contoh: true` diberi label peringatan yang mencolok supaya tidak
//    pernah tampak seperti testimoni asli. Lihat catatan lengkap di src/data/testimoni.ts
//    dan aturan "hanya testimoni asli, dengan izin" di PRD §5 #9.
export default function Testimonials() {
  if (testimoni.length === 0) return null;

  return (
    <section className="border-y border-kraft-garis bg-kertas">
      <div className="mx-auto max-w-[1160px] px-6 py-22">
        <h2 className="m-0 mb-9 text-[clamp(34px,4.2vw,52px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
          Kata pembeli
        </h2>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-5">
          {testimoni.map((item, indeks) => {
            // Kartu pertama bergaya solid, berikutnya bergaya border putus-putus —
            // mengikuti referensi desain.
            const gayaSolid = indeks % 2 === 0;

            return (
              <figure
                key={item.id}
                className={`m-0 flex flex-col gap-4 p-7 ${
                  gayaSolid
                    ? "rounded-[20px] bg-krem before:content-['\u201C'] before:font-judul before:text-[44px] before:leading-[0.6] before:font-extrabold before:text-kraft-titik"
                    : 'rounded-[20px] border-2 border-dashed border-kraft-titik'
                }`}
              >
                {item.contoh && (
                  <span className="w-fit rounded-full bg-emas px-3 py-1 text-[12px] font-bold text-kakao uppercase">
                    Contoh — menunggu testimoni asli
                  </span>
                )}

                <blockquote className="m-0 text-[19px] leading-[1.5]">{item.kutipan}</blockquote>

                <figcaption className="text-[14px] font-semibold text-redup">
                  {item.nama}, {item.kota}
                  {item.produk ? ` · ${item.produk}` : ''}
                </figcaption>
              </figure>
            );
          })}
        </div>

        {testimoni.some((item) => item.contoh) && (
          <p className="mt-6 max-w-[70ch] text-[14px] text-redup">
            Catatan staging: kartu di atas masih berisi teks contoh, belum kutipan pembeli.
            Testimoni asli akan dipasang setelah Bu Aviella memberi izin pemakaian kutipan chat
            pembeli. Section ini tidak akan terbit di produksi selama masih berisi contoh.
          </p>
        )}
      </div>
    </section>
  );
}
