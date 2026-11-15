import { site } from '@/data/site';
import { marketplaceAktif } from '@/lib/mode';

// Section #cara-pesan (HANDOFF §7.7): <ol> 3 langkah + 2 kotak info
// Pengiriman & Pembayaran. Server component.
//
// Dua versi langkah, sesuai cara pesan yang benar-benar tersedia:
//   - Fase 1 (marketplace nonaktif): lewat WhatsApp.
//   - Marketplace aktif: keranjang dan checkout, bukti transfer tetap lewat WhatsApp.
const langkahWhatsApp = [
  {
    judul: 'Pilih varian',
    isi: 'Klik "Pesan ini" pada peyek yang kamu mau.',
  },
  {
    judul: 'Chat di WhatsApp',
    isi: 'Pesan sudah terisi otomatis. Tambahkan jumlah, nama, dan alamat kirim.',
  },
  {
    judul: 'Transfer, lalu dikirim',
    isi: 'Bu Aviella kirim total + ongkir. Setelah transfer, pesanan dikemas dan dikirim.',
  },
];

const langkahKeranjang = [
  {
    judul: 'Pilih varian',
    isi: 'Tekan "Tambah ke keranjang" pada peyek yang kamu mau.',
  },
  {
    judul: 'Isi data pengiriman',
    isi: 'Buka keranjang, isi nama dan alamat, lalu pilih ongkir. Tanpa daftar akun.',
  },
  {
    judul: 'Transfer, lalu dikirim',
    isi: 'Transfer sesuai total di halaman pesanan, kirim buktinya lewat WhatsApp. Pesanan lalu dikemas dan dikirim.',
  },
];

export default function HowToOrder() {
  const aktif = marketplaceAktif();
  const langkah = aktif ? langkahKeranjang : langkahWhatsApp;
  const kurir = site.kurir.length > 0 ? site.kurir.join(' / ') : null;
  const bank = site.bank.length > 0 ? site.bank.join(', ') : null;

  return (
    <section id="cara-pesan" className="mx-auto max-w-[1160px] px-6 py-24">
      <h2 className="m-0 mb-10 text-seksi leading-[1.05] font-extrabold tracking-[-0.02em]">
        Cara pesan peyek
      </h2>

      <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-5 p-0">
        {langkah.map((item, indeks) => (
          <li
            key={item.judul}
            className="flex flex-col gap-3 rounded-[20px] border border-kraft-garis bg-kertas p-[26px]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emas font-judul text-kartu font-extrabold">
              {indeks + 1}
            </span>
            <h3 className="m-0 text-kartu font-bold">{item.judul}</h3>
            <p className="m-0 text-redup">{item.isi}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-5">
        <div className="flex flex-col gap-1.5 rounded-[20px] bg-kraft p-6">
          <h3 className="m-0 mb-1 text-lead font-bold">Pengiriman</h3>
          {kurir && <span>Kurir: {kurir}</span>}
          {site.areaKirim && <span>Area: {site.areaKirim}</span>}
          {site.alamat && <span>Ambil sendiri: {site.alamat}</span>}
          {!kurir && !site.areaKirim && <span>{aktif ? 'Ongkir dihitung saat checkout sesuai tujuan.' : 'Ongkir dihitung dan dikirim lewat WhatsApp.'}</span>}
        </div>

        <div className="flex flex-col gap-1.5 rounded-[20px] bg-kraft p-6">
          <h3 className="m-0 mb-1 text-lead font-bold">Pembayaran</h3>
          <span>{bank ? `Transfer ${bank}` : 'Pembayaran lewat transfer bank'}</span>
          <span>
            {aktif ? 'Nomor rekening tampil setelah pesanan dibuat' : 'Nomor rekening dikirim lewat WhatsApp'}
          </span>
        </div>
      </div>
    </section>
  );
}
