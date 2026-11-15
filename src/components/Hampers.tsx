import { site } from '@/data/site';
import { waHampers } from '@/lib/whatsapp';
import WaLink from './WaLink';
import PlaceholderFoto from './PlaceholderFoto';
import { IkonChat } from './PeyekIllustration';

// Section #hampers (HANDOFF §7.5). Server component.
export default function Hampers() {
  const { minimalPaket, tutupPO } = site.hampers;

  return (
    <section
      id="hampers"
      className="mx-auto grid max-w-[1160px] items-center gap-14 px-6 py-24 lg:grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))]"
    >
      <PlaceholderFoto className="min-h-[240px] rounded-[28px] lg:min-h-[420px]" />

      <div className="flex flex-col gap-5">
        <span className="text-ket font-bold tracking-[0.08em] text-cabai uppercase">
          Hampers & pesanan besar
        </span>
        <h2 className="m-0 text-seksi leading-[1.05] font-extrabold tracking-[-0.02em]">
          Untuk arisan, hajatan, dan kiriman Lebaran.
        </h2>
        <p className="m-0 max-w-[48ch] text-redup">
          Bisa dikemas per paket, diberi kartu ucapan, dan disusun sesuai budget. Pesan lebih awal
          karena kapasitas dapur dibatasi.
        </p>

        {(minimalPaket !== null || tutupPO !== null) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {minimalPaket !== null && (
              <div className="flex flex-col gap-1.5 rounded-[20px] bg-kraft p-6">
                <h3 className="m-0 mb-1 text-lead font-bold">Minimal paket</h3>
                <span className="text-redup">{minimalPaket} paket</span>
              </div>
            )}
            {tutupPO !== null && (
              <div className="flex flex-col gap-1.5 rounded-[20px] bg-kraft p-6">
                <h3 className="m-0 mb-1 text-lead font-bold">Tutup pre-order</h3>
                <span className="text-redup">{tutupPO}</span>
              </div>
            )}
          </div>
        )}

        <WaLink
          href={waHampers()}
          lokasi="hampers"
          className="inline-flex min-h-14 w-fit items-center gap-2.5 rounded-full bg-cabai px-7 text-isi font-bold text-white no-underline hover:bg-cabai-tua"
        >
          <IkonChat />
          <span>Tanya paket hampers</span>
        </WaLink>
      </div>
    </section>
  );
}
