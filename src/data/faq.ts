// src/data/faq.ts
// Dipakai untuk section FAQ (HANDOFF §7.9). Item pertama dirender dengan atribut `open`.
//
// Skema `FAQPage` SENGAJA tidak dipasang: sejak Agustus 2023 Google hanya menampilkan
// rich result FAQ untuk situs pemerintah dan kesehatan, jadi untuk toko ia tidak memberi
// manfaat. Jawaban tetap ditulis jawaban-dulu supaya mudah dikutip mesin pencari dan AI.

export interface ItemFaq {
  pertanyaan: string;
  jawaban: string;
}

export const faq: ItemFaq[] = [
  {
    pertanyaan: 'Peyek tahan berapa lama?',
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
  {
    // Riset kata kunci: "rempeyek" masih dicari ±5.400 kali/bulan. Pertanyaan ini
    // menangkap pencarian itu tanpa mengubah istilah yang dipakai di seluruh situs.
    pertanyaan: 'Apa bedanya peyek dan rempeyek?',
    jawaban:
      'Tidak ada. Peyek dan rempeyek adalah dua sebutan untuk camilan yang sama: gorengan tipis dan renyah dari adonan tepung, berisi kacang, teri, atau rebon. Di sini kami memakai sebutan peyek, tetapi barangnya sama dengan yang biasa kamu cari dengan nama rempeyek.',
  },
];
