import { site } from '@/data/site';
import { formatBerat, formatRupiah } from '@/lib/format';
import type { ProdukKartu } from '@/lib/katalog';
import { buildWaLink, pesan } from '@/lib/whatsapp';
import PeyekIllustration from './PeyekIllustration';
import TambahKeKeranjang from './TambahKeKeranjang';
import WaLink from './WaLink';

// Kartu produk (HANDOFF §7.3). Server component.
//
// `dariDb` true  → marketplace: judul menaut ke /produk/<slug> dan tombolnya
//                  "Tambah ke keranjang". Hanya bila produk punya id database
//                  (id > 0); data cadangan tidak bisa dipesan lewat keranjang.
// `dariDb` false → tampilan Fase 1: tombol WhatsApp, persis seperti sebelumnya.
export default function ProductCard({ produk: item, dariDb }: { produk: ProdukKartu; dariDb: boolean }) {
  const po = item.status === 'po';
  const habis = item.status === 'habis';
  const bisaKeranjang = dariDb && item.id !== null && item.id > 0;

  const labelStatus = habis ? 'Habis' : po ? 'Pre-order' : 'Tersedia';
  const badgeKelas = po
    ? 'bg-emas text-kakao'
    : habis
      ? 'bg-kraft text-redup'
      : 'bg-kakao text-krem';

  // Status `habis` → tombol jadi "Tanya stok", tetap ke WhatsApp (HANDOFF §5).
  const labelCta = habis ? 'Tanya stok' : po ? 'Tanya PO' : 'Pesan ini';
  const isiPesan = po ? pesan.produkPo(item.nama) : pesan.produk(item.nama);

  const adaGambar = item.gambar.length > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] border border-kraft-garis bg-kertas">
      <div className="pola-titik relative flex h-[210px] items-center justify-center bg-kraft">
        {adaGambar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.gambar[0]} alt={item.nama} className="h-full w-full object-cover" />
        ) : (
          <PeyekIllustration warnaIsian={item.warna_isian} className="h-[131px] w-[170px]" />
        )}

        <span
          className={`absolute top-3.5 right-3.5 rounded-full px-3 py-1 text-[13px] font-bold ${badgeKelas}`}
        >
          {labelStatus}
        </span>

        {!adaGambar && (
          <span className="absolute bottom-3 left-3.5 text-[12px] font-semibold text-redup">
            [FOTO ASLI]
          </span>
        )}
      </div>

      <div className="flex grow flex-col gap-2 p-5">
        <h3 className="m-0 text-[22px] leading-[1.15] font-bold">
          {dariDb ? (
            <a href={`/produk/${item.slug}`} className="text-kakao no-underline hover:underline">
              {item.nama}
            </a>
          ) : (
            item.nama
          )}
        </h3>
        <p className="m-0 grow text-[15px] text-redup">{item.deskripsi}</p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex flex-col leading-[1.2]">
            <span className="font-judul text-[22px] font-extrabold">{formatRupiah(item.harga)}</span>
            <span className="text-[13px] text-redup">{formatBerat(item.berat_gram)}</span>
          </div>

          {bisaKeranjang ? (
            <TambahKeKeranjang produkId={item.id as number} nama={item.nama} status={item.status} />
          ) : (
            <WaLink
              href={buildWaLink(site.whatsapp, isiPesan)}
              lokasi="kartu"
              produk={item.slug}
              aria-label={`${labelCta}: ${item.nama}`}
              className="inline-flex min-h-11 items-center rounded-full border-2 border-cabai px-[18px] text-[15px] font-bold text-cabai no-underline hover:bg-cabai hover:text-white"
            >
              {labelCta}
            </WaLink>
          )}
        </div>
      </div>
    </article>
  );
}
