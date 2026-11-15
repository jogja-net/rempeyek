import { site } from '@/data/site';
import { marketplaceAktif } from '@/lib/mode';
import { waUmum } from '@/lib/whatsapp';
import IkonKeranjang from './IkonKeranjang';
import WaLink from './WaLink';
import { IkonChat, PeyekLogo } from './PeyekIllustration';

// Header sticky (HANDOFF §7.1). Server component — CTA memakai WaLink (client).
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-kraft-garis bg-krem">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-3 px-4 py-3.5 sm:gap-6 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 text-kakao no-underline">
          <PeyekLogo className="hidden h-[31px] w-10 min-[420px]:block" />
          <span className="font-judul text-lead font-extrabold tracking-[-0.01em] whitespace-nowrap">{site.nama}</span>
        </a>

        <nav aria-label="Navigasi utama" className="hidden gap-7 text-isi font-semibold min-[761px]:flex">
          <a href="#varian" className="no-underline hover:underline">
            Varian
          </a>
          <a href="#hampers" className="no-underline hover:underline">
            Hampers
          </a>
          <a href="#cara-pesan" className="no-underline hover:underline">
            Cara pesan
          </a>
          <a href="#faq" className="no-underline hover:underline">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {/* Hanya saat marketplace aktif (Task 9); di produksi header tidak berubah. */}
          {marketplaceAktif() && <IkonKeranjang />}
          <WaLink
            href={waUmum()}
            lokasi="header"
            aria-label="Pesan via WhatsApp"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cabai px-4 text-isi font-bold text-white no-underline hover:bg-cabai-tua"
          >
            <IkonChat className="h-[18px] w-[18px]" />
            <span className="max-[359px]:hidden">Pesan</span>
          </WaLink>
        </div>
      </div>
    </header>
  );
}
