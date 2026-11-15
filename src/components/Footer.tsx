import { site } from '@/data/site';
import { waUmum } from '@/lib/whatsapp';

// Footer kakao (HANDOFF §7.11). Link yang null TIDAK dirender.
export default function Footer() {
  const tahun = new Date().getFullYear();
  const nomorTeks = site.whatsapp ? `+${site.whatsapp}` : null;

  // NAP (Name, Address, Phone) harus sama persis dengan Google Business Profile (PRD §7).
  const tautanSosmed = [
    site.shopee ? { label: `Shopee ${site.shopee}`, href: site.shopee } : null,
    site.instagram ? { label: `Instagram @${site.instagram}`, href: `https://instagram.com/${site.instagram}` } : null,
    site.tiktok ? { label: `TikTok @${site.tiktok}`, href: `https://tiktok.com/@${site.tiktok}` } : null,
  ].filter((item): item is { label: string; href: string } => item !== null);

  return (
    <footer className="bg-kakao text-redup-terang">
      <div className="mx-auto grid max-w-[1160px] grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-8 px-6 pt-14 pb-10 text-isi">
        <div className="flex flex-col gap-2">
          <span className="font-judul text-kartu font-extrabold text-krem">{site.nama}</span>
          {site.alamat && <span>{site.alamat}</span>}
          {site.jamLayanan && <span>Buka {site.jamLayanan}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-bold text-krem">Pesan</span>
          {nomorTeks && (
            <a href={waUmum()} target="_blank" rel="noopener" className="text-emas">
              WhatsApp {nomorTeks}
            </a>
          )}
          {site.shopee && (
            <a href={site.shopee} target="_blank" rel="noopener" className="text-emas">
              Shopee {site.shopee}
            </a>
          )}
          {site.kurir.length > 0 && <span>Kurir: {site.kurir.join(' / ')}</span>}
        </div>

        {tautanSosmed.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-bold text-krem">Ikuti</span>
            {tautanSosmed.map((item) => (
              <a key={item.href} href={item.href} target="_blank" rel="noopener" className="text-emas">
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-[1160px] px-6 pb-8 text-ket text-[#B8A07C]">
        © {tahun} {site.nama}
      </div>
    </footer>
  );
}
