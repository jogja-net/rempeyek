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
      <PlaceholderFoto
        label="[FOTO ASLI] Hampers rempeyek: toples, pita, kartu ucapan"
        className="min-h-[420px] rounded-[28px]"
        tanpaIlustrasi
      />

      <div className="flex flex-col gap-5">
        <span className="text-[14px] font-bold tracking-[0.08em] text-cabai uppercase">
          Hampers & pesanan besar
        </span>
        <h2 className="m-0 text-[clamp(34px,4.2vw,52px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
          Untuk arisan, hajatan, dan kiriman Lebaran.
        </h2>
        <p className="m-0 max-w-[48ch] text-redup">
          Bisa dikemas per paket, diberi kartu ucapan, dan disusun sesuai budget. Pesan lebih awal
          karena kapasitas dapur dibatasi.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 rounded-[20px] bg-kraft p-6">
            <h3 className="m-0 mb-1 text-[19px] font-bold">Minimal paket</h3>
            <span className="text-redup">
              {minimalPaket === null ? '[JUMLAH] paket' : `${minimalPaket} paket`}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 rounded-[20px] bg-kraft p-6">
            <h3 className="m-0 mb-1 text-[19px] font-bold">Tutup pre-order</h3>
            <span className="text-redup">{tutupPO ?? '[TANGGAL]'}</span>
          </div>
        </div>

        <WaLink
          href={waHampers()}
          lokasi="hampers"
          className="inline-flex min-h-14 w-fit items-center gap-2.5 rounded-full bg-cabai px-7 text-[17px] font-bold text-white no-underline hover:bg-cabai-tua"
        >
          <IkonChat />
          <span>Tanya paket hampers</span>
        </WaLink>
      </div>
    </section>
  );
}
