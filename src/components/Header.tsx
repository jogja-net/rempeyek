import { site } from '@/data/site';
import { waUmum } from '@/lib/whatsapp';
import WaLink from './WaLink';
import { IkonChat, PeyekLogo } from './PeyekIllustration';

// Header sticky (HANDOFF §7.1). Server component — CTA memakai WaLink (client).
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-kraft-garis bg-krem">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-6 px-6 py-3.5">
        <a href="#top" className="flex items-center gap-2.5 text-kakao no-underline">
          <PeyekLogo className="h-[31px] w-10" />
          <span className="font-judul text-[20px] font-extrabold tracking-[-0.01em]">{site.nama}</span>
        </a>

        <nav aria-label="Navigasi utama" className="hidden gap-7 text-[15px] font-semibold min-[761px]:flex">
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

        <WaLink
          href={waUmum()}
          lokasi="header"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cabai px-[18px] text-[15px] font-bold text-white no-underline hover:bg-cabai-tua"
        >
          <IkonChat className="h-[18px] w-[18px]" />
          <span>Pesan</span>
        </WaLink>
      </div>
    </header>
  );
}
