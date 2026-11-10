// Section "Kenapa pesan langsung" (HANDOFF §7.6) — section kraft, 3 kolom
// dengan garis atas kakao 3px. Server component, tanpa data eksternal.
const alasan = [
  {
    judul: 'Digoreng saat dipesan',
    isi: 'Rempeyek dibuat setelah pesanan masuk, bukan stok lama yang menunggu di rak.',
  },
  {
    judul: 'Langsung ke pembuatnya',
    isi: 'Tanya komposisi, minta dipisah per varian, atau atur jumlah besar tanpa perantara.',
  },
  {
    judul: 'Dikemas setelah dingin',
    isi: 'Dikemas rapat setelah benar-benar dingin supaya tetap kriuk sampai tujuan.',
  },
];

export default function WhyUs() {
  return (
    <section className="bg-kraft">
      <div className="mx-auto max-w-[1160px] px-6 py-24">
        <h2 className="m-0 mb-10 text-[clamp(34px,4.2vw,52px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
          Kenapa pesan langsung
        </h2>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-8">
          {alasan.map((item) => (
            <div key={item.judul} className="flex flex-col gap-3 border-t-[3px] border-kakao pt-5">
              <h3 className="m-0 text-[21px] font-bold">{item.judul}</h3>
              <p className="m-0 text-redup">{item.isi}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
