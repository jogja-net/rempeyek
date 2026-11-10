import { site } from '@/data/site';
import { atau } from '@/lib/format';
import { waUmum } from '@/lib/whatsapp';
import WaLink from './WaLink';
import { IkonChat } from './PeyekIllustration';

// Band CTA emas + tombol kakao (HANDOFF §7.10). Server component.
export default function CtaBand() {
  return (
    <section className="bg-emas">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-7 px-6 py-20">
        <div className="flex flex-col gap-2.5">
          <h2 className="m-0 text-[clamp(36px,4.6vw,58px)] leading-none font-extrabold tracking-[-0.02em]">
            Lagi pengin yang kriuk?
          </h2>
          <p className="m-0 text-[18px] text-[#3D2A1A]">
            Chat sekarang. Bu Aviella membalas pukul {atau(site.jamLayanan, '[JAM LAYANAN]')}.
          </p>
        </div>

        <WaLink
          href={waUmum()}
          lokasi="cta"
          className="inline-flex min-h-14 items-center gap-2.5 rounded-full bg-kakao px-7 text-[17px] font-bold text-krem no-underline hover:bg-[#3E2716]"
        >
          <IkonChat />
          <span>Pesan via WhatsApp</span>
        </WaLink>
      </div>
    </section>
  );
}
