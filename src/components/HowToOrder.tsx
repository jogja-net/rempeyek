import { site } from '@/data/site';
import { atau } from '@/lib/format';

// Section #cara-pesan (HANDOFF §7.7): <ol> 3 langkah + 2 kotak info
// Pengiriman & Pembayaran. Server component.
const langkah = [
  {
    judul: 'Pilih varian',
    isi: 'Klik "Pesan ini" pada rempeyek yang kamu mau.',
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

export default function HowToOrder() {
  const kurir = site.kurir.length > 0 ? site.kurir.join(' / ') : '[JNE / J&T / SICEPAT]';
  const bank = site.bank.length > 0 ? site.bank.join(', ') : '[NAMA BANK]';

  return (
    <section id="cara-pesan" className="mx-auto max-w-[1160px] px-6 py-24">
      <h2 className="m-0 mb-10 text-[clamp(34px,4.2vw,52px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
        Cara pesan
      </h2>

      <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-5 p-0">
        {langkah.map((item, indeks) => (
          <li
            key={item.judul}
            className="flex flex-col gap-3 rounded-[20px] border border-kraft-garis bg-kertas p-[26px]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emas font-judul text-[22px] font-extrabold">
              {indeks + 1}
            </span>
            <h3 className="m-0 text-[21px] font-bold">{item.judul}</h3>
            <p className="m-0 text-redup">{item.isi}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-5">
        <div className="flex flex-col gap-1.5 rounded-[20px] bg-kraft p-6">
          <h3 className="m-0 mb-1 text-[19px] font-bold">Pengiriman</h3>
          <span>Kurir: {kurir}</span>
          <span>Area: {atau(site.areaKirim, '[AREA PENGIRIMAN]')}</span>
          <span>Ambil sendiri: {atau(site.alamat, '[ALAMAT PENGAMBILAN]')}</span>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[20px] bg-kraft p-6">
          <h3 className="m-0 mb-1 text-[19px] font-bold">Pembayaran</h3>
          <span>Transfer {bank}</span>
          <span>[QRIS — jika tersedia]</span>
          <span>Nomor rekening dikirim lewat WhatsApp</span>
        </div>
      </div>
    </section>
  );
}
