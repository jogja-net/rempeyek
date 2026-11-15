import { site } from '@/data/site';
import type { KatalogLanding } from '@/lib/katalog';
import ProductCard from './ProductCard';

// Section #varian (HANDOFF §7.3). Server component; katalog dioper dari page.tsx.
export default function ProductGrid({ katalog }: { katalog: KatalogLanding }) {
  const { peyek, dariDb } = katalog;

  // Berat kemasan ditampilkan di subjudul bila semua varian punya berat yang sama.
  const daftarBerat = peyek
    .map((p) => p.berat_gram)
    .filter((b): b is number => typeof b === 'number' && b > 0);
  const beratSeragam =
    daftarBerat.length === peyek.length && new Set(daftarBerat).size === 1 ? daftarBerat[0] : null;
  const beratTeks = beratSeragam !== null ? String(beratSeragam) : '[BERAT]';

  return (
    <section id="varian" className="mx-auto max-w-[1160px] px-6 pt-6 pb-24">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <h2 className="m-0 text-[clamp(34px,4.2vw,52px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
          Pilih varian peyek
        </h2>
        <p className="m-0 max-w-[42ch] text-redup">
          Harga per kemasan {beratTeks} g. Stok habis? Masih bisa pesan pre-order.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-5">
        {peyek.map((item) => (
          <ProductCard key={item.slug} produk={item} dariDb={dariDb} />
        ))}
      </div>

      {site.areaKirim === null && (
        <p className="mt-6 text-[14px] text-redup">
          Catatan staging: area pengiriman belum diisi, hubungi Bu Aviella untuk konfirmasi ongkir.
        </p>
      )}
    </section>
  );
}
