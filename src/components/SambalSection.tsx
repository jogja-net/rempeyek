import { sambal } from '@/data/sambal';
import { site } from '@/data/site';
import { formatRupiah, atau } from '@/lib/format';
import { buildWaLink, pesan } from '@/lib/whatsapp';
import WaLink from './WaLink';
import { IkonSambal } from './PeyekIllustration';

// Section sambal (HANDOFF §7.4) — hanya dirender bila site.tampilkanSambal = true
// dan daftar sambal tidak kosong. Lihat acceptance §11: "section sambal hilang saat
// tampilkanSambal = false".
export default function SambalSection() {
  if (!site.tampilkanSambal || sambal.length === 0) return null;

  return (
    <section className="bg-kakao text-krem">
      <div className="mx-auto grid max-w-[1160px] items-center gap-12 px-6 py-22 lg:grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))]">
        <div className="flex flex-col gap-4.5">
          <span className="text-[14px] font-bold tracking-[0.08em] text-emas uppercase">
            Teman makan
          </span>
          <h2 className="m-0 text-[clamp(34px,4.2vw,52px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
            Lebih nikmat ditemani sambal.
          </h2>
          <p className="m-0 max-w-[40ch] text-redup-terang">
            Tambahkan sambal ke pesanan rempeyek, kirim dalam satu paket.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4">
          {sambal.map((item) => (
            <article
              key={item.slug}
              className="flex flex-col gap-3.5 rounded-[20px] border border-[#5A3D25] bg-kakao-2 p-[22px]"
            >
              <IkonSambal />
              <h3 className="m-0 text-[22px] font-bold">{item.nama}</h3>
              <span className="text-[15px] text-redup-terang">
                {atau(item.ukuran, '[UKURAN]')} · {formatRupiah(item.harga)}
              </span>
              <WaLink
                href={buildWaLink(site.whatsapp, pesan.sambal(item.nama))}
                lokasi="sambal"
                produk={item.slug}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-emas px-4 text-[15px] font-bold text-kakao no-underline hover:bg-[#DBA02F]"
              >
                Tambah ke pesanan
              </WaLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
