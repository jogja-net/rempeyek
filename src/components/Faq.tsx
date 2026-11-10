import { faq } from '@/data/faq';
import { waReseller } from '@/lib/whatsapp';

// Section #faq (HANDOFF §7.9): <details>/<summary> native, item pertama `open`.
// Server component — FAQ tetap ada di HTML hasil build untuk SEO.
export default function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-[860px] px-6 py-24">
      <h2 className="m-0 mb-8 text-[clamp(34px,4.2vw,52px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
        Pertanyaan yang sering masuk
      </h2>

      <div className="flex flex-col gap-3">
        {faq.map((item, indeks) => (
          <details
            key={item.pertanyaan}
            open={indeks === 0}
            className="rounded-2xl border border-kraft-garis bg-kertas px-6 py-5"
          >
            <summary className="ringkasan-faq text-[18px] font-bold">{item.pertanyaan}</summary>
            <p className="m-0 mt-2.5 text-redup">
              {item.jawaban}
              {item.pertanyaan.startsWith('Bisa jadi reseller') && (
                <>
                  {' '}
                  <a href={waReseller()} target="_blank" rel="noopener" className="font-semibold">
                    Chat Bu Aviella
                  </a>{' '}
                  untuk harga grosir dan jadwal stok.
                </>
              )}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
