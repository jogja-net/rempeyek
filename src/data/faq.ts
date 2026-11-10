// src/data/faq.ts
// Dipakai untuk section FAQ (HANDOFF §7.9) sekaligus JSON-LD FAQPage (HANDOFF §8).
// Item pertama dirender dengan atribut `open`.

export interface ItemFaq {
  pertanyaan: string;
  jawaban: string;
}

export const faq: ItemFaq[] = [
  {
    pertanyaan: 'Rempeyek tahan berapa lama?',
    jawaban: '[X] hari dalam kemasan tertutup. Simpan di tempat kering dan tutup rapat setelah dibuka.',
  },
  {
    pertanyaan: 'Aman dikirim ke luar kota?',
    jawaban: '[Jelaskan cara pengemasan untuk kirim jauh, misalnya toples + bubble wrap.]',
  },
  {
    pertanyaan: 'Ada minimal pesanan?',
    jawaban: 'Eceran tanpa minimal. Hampers minimal [JUMLAH] paket.',
  },
  {
    pertanyaan: 'Bisa jadi reseller atau titip jual?',
    jawaban: 'Bisa. Chat Bu Aviella untuk harga grosir dan jadwal stok.',
  },
];
