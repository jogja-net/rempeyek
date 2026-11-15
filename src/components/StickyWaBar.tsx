import { formatRupiah } from '@/lib/format';
import { hargaTerendah, type KatalogLanding } from '@/lib/katalog';
import { waUmum } from '@/lib/whatsapp';
import WaLink from './WaLink';

// Sticky bar WA (HANDOFF §7.12) — hanya tampil di bawah 760px.
export default function StickyWaBar({ katalog }: { katalog: KatalogLanding }) {
  const harga = hargaTerendah(katalog.peyek);

  return (
    <div className="sticky bottom-0 z-50 flex items-center justify-between gap-3 border-t border-kraft-garis bg-kertas px-4 py-3 min-[761px]:hidden">
      <span className="text-[14px] font-semibold">Mulai {formatRupiah(harga)}</span>
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
