import { site } from '@/data/site';
import { formatRupiah } from '@/lib/format';
import type { KatalogLanding } from '@/lib/katalog';
import { buildWaLink, pesan } from '@/lib/whatsapp';
import WaLink from './WaLink';
import { IkonSambal } from './PeyekIllustration';
import TambahKeKeranjang from './TambahKeKeranjang';

// Section sambal (HANDOFF §7.4) — hanya dirender bila site.tampilkanSambal = true
// dan daftar sambal tidak kosong. Lihat acceptance §11: "section sambal hilang saat
// tampilkanSambal = false".
export default function SambalSection({ katalog }: { katalog: KatalogLanding }) {
  const { sambal, dariDb } = katalog;
  if (!site.tampilkanSambal || sambal.length === 0) return null;

  return (
    <section className="bg-kakao text-krem">
      <div className="mx-auto grid max-w-[1160px] items-center gap-12 px-6 py-22 lg:grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))]">
        <div className="flex flex-col gap-4.5">
          <span className="text-ket font-bold tracking-[0.08em] text-emas uppercase">
            Teman makan
          </span>
          <h2 className="m-0 text-seksi leading-[1.05] font-extrabold tracking-[-0.02em]">
            Lebih nikmat ditemani sambal.
          </h2>
          <p className="m-0 max-w-[40ch] text-redup-terang">
            Tambahkan sambal ke pesanan peyek, kirim dalam satu paket.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4">
          {sambal.map((item) => (
            <article
              key={item.slug}
              className="flex flex-col gap-3.5 rounded-[20px] border border-[#5A3D25] bg-kakao-2 p-[22px]"
            >
              <IkonSambal />
              <h3 className="m-0 text-kartu font-bold">{item.nama}</h3>
              <span className="text-isi text-redup-terang">
                {[item.ukuran, item.harga !== null ? formatRupiah(item.harga) : null]
                  .filter(Boolean)
                  .join(' · ') || 'Tanya harga lewat WhatsApp'}
              </span>
              {dariDb && item.id !== null && item.id > 0 ? (
                <TambahKeKeranjang
                  produkId={item.id}
                  nama={item.nama}
                  status={item.status}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-emas px-4 text-isi font-bold text-kakao hover:bg-[#DBA02F] disabled:cursor-not-allowed disabled:bg-kakao-2 disabled:text-redup-terang"
                />
              ) : (
                <WaLink
                  href={buildWaLink(site.whatsapp, pesan.sambal(item.nama))}
                  lokasi="sambal"
                  produk={item.slug}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-emas px-4 text-isi font-bold text-kakao no-underline hover:bg-[#DBA02F]"
                >
                  Tambah ke pesanan
                </WaLink>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
