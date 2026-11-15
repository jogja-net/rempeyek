import { site } from '@/data/site';
import { waUmum } from '@/lib/whatsapp';
import WaLink from './WaLink';
import { IkonChat } from './PeyekIllustration';

// Band CTA emas + tombol kakao (HANDOFF §7.10). Server component.
export default function CtaBand() {
  return (
    <section className="bg-emas">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-7 px-6 py-20">
        <div className="flex flex-col gap-2.5">
          <h2 className="m-0 text-seksi leading-none font-extrabold tracking-[-0.02em]">
            Lagi pengin yang kriuk?
          </h2>
          <p className="m-0 text-lead text-[#3D2A1A]">
            Chat sekarang.{site.jamLayanan ? ` Bu Aviella membalas pukul ${site.jamLayanan}.` : ''}
          </p>
        </div>

        <WaLink
          href={waUmum()}
          lokasi="cta"
          className="inline-flex min-h-14 items-center gap-2.5 rounded-full bg-kakao px-7 text-isi font-bold text-krem no-underline hover:bg-[#3E2716]"
        >
          <IkonChat />
          <span>Pesan via WhatsApp</span>
        </WaLink>
      </div>
    </section>
  );
}
