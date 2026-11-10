import { site } from '@/data/site';
import { produk } from '@/data/products';
import { formatRupiah } from '@/lib/format';
import { waUmum } from '@/lib/whatsapp';
import WaLink from './WaLink';
import PlaceholderFoto from './PlaceholderFoto';
import { IkonChat, PeyekHeroKedua, PeyekHeroUtama } from './PeyekIllustration';

// Hero 2 kolom (HANDOFF §7.2). Server component.
export default function Hero() {
  // Harga terendah dari produk yang sudah punya harga → stiker "mulai Rp …".
  const daftarHarga = produk.map((p) => p.harga).filter((h): h is number => typeof h === 'number');
  const hargaTerendah = daftarHarga.length > 0 ? Math.min(...daftarHarga) : null;

  // Area kirim & PIRT hanya dirender bila datanya ada.
  const areaKirim = site.areaKirim ?? '[AREA PENGIRIMAN]';
  const garisInfo = [
    'Eceran & hampers',
    `Kirim ke ${areaKirim}`,
    site.legalitas.pirt ? `PIRT ${site.legalitas.pirt}` : null,
  ].filter((baris): baris is string => baris !== null);

  return (
    <section
      id="top"
      className="mx-auto grid max-w-[1160px] items-center gap-14 px-6 pt-16 pb-22 lg:grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))]"
    >
      <div className="flex flex-col gap-6">
        <span className="inline-flex self-start items-center gap-2 rounded-full bg-kraft px-3.5 py-1.5 text-[14px] font-semibold text-redup">
          Digoreng di dapur rumah · {site.kota ?? '[KOTA]'}
        </span>

        <h1 className="m-0 text-[clamp(42px,6.2vw,76px)] leading-none font-extrabold tracking-[-0.03em]">
          Rempeyek kacang yang kriuknya bikin nambah nasi.
        </h1>

        <p className="m-0 max-w-[46ch] text-[18px] text-redup">
          Digoreng tipis satu per satu, dikemas setelah benar-benar dingin. Pesan langsung ke Bu
          Aviella lewat WhatsApp — tanpa aplikasi, tanpa daftar akun.
        </p>

        <div className="flex flex-wrap items-start gap-3.5">
          <WaLink
            href={waUmum()}
            lokasi="hero"
            className="inline-flex min-h-14 items-center gap-2.5 rounded-full bg-cabai px-7 text-[17px] font-bold text-white no-underline hover:bg-cabai-tua"
          >
            <IkonChat />
            <span>Pesan via WhatsApp</span>
          </WaLink>
          <a
            href="#varian"
            className="inline-flex min-h-14 items-center rounded-full border-2 border-kakao px-6 text-[17px] font-bold text-kakao no-underline hover:bg-kakao hover:text-krem"
          >
            Lihat varian
          </a>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-[14px] font-medium text-redup">
          {garisInfo.map((baris) => (
            <span key={baris}>{baris}</span>
          ))}
        </div>
      </div>

      <div className="relative min-h-[520px] overflow-hidden rounded-[28px] bg-kraft">
        <div className="pola-titik absolute inset-0" aria-hidden="true" />

        {/* Area foto asli */}
        <div className="absolute inset-5 flex items-end rounded-[20px] border-2 border-dashed border-kraft-titik p-5">
          <span className="rounded-lg bg-krem px-3 py-1.5 text-[13px] font-semibold text-redup">
            [FOTO ASLI] Close-up rempeyek kacang dipatahkan, cahaya dari samping
          </span>
        </div>

        {/* Dua ilustrasi peyek */}
        <PeyekHeroUtama className="absolute top-[12%] left-[8%] w-[62%] -rotate-12" />
        <PeyekHeroKedua className="absolute top-[46%] right-[4%] w-[44%] rotate-18" />

        {/* Stiker bulat emas */}
        <div className="absolute top-[8%] right-[7%] flex h-[132px] w-[132px] -rotate-8 flex-col items-center justify-center rounded-full bg-emas text-center leading-[1.15] text-kakao">
          <span className="text-[13px] font-semibold">mulai</span>
          <span className="font-judul text-[22px] font-extrabold">{formatRupiah(hargaTerendah)}</span>
        </div>
      </div>
    </section>
  );
}
