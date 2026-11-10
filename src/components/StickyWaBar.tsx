import { produk } from '@/data/products';
import { formatRupiah } from '@/lib/format';
import { waUmum } from '@/lib/whatsapp';
import WaLink from './WaLink';

// Sticky bar WA (HANDOFF §7.12) — hanya tampil di bawah 760px.
export default function StickyWaBar() {
  const daftarHarga = produk.map((p) => p.harga).filter((h): h is number => typeof h === 'number');
  const hargaTerendah = daftarHarga.length > 0 ? Math.min(...daftarHarga) : null;

  return (
    <div className="sticky bottom-0 z-50 flex items-center justify-between gap-3 border-t border-kraft-garis bg-kertas px-4 py-3 min-[761px]:hidden">
      <span className="text-[14px] font-semibold">Mulai {formatRupiah(hargaTerendah)}</span>
      <WaLink
        href={waUmum()}
        lokasi="sticky"
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-cabai px-5 text-[15px] font-bold text-white no-underline hover:bg-cabai-tua"
      >
        Pesan via WhatsApp
      </WaLink>
    </div>
  );
}
