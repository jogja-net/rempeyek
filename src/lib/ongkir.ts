// src/lib/ongkir.ts
//
// Tarif ongkir TIRUAN per zona untuk mode demo. Antarmuka sengaja dijaga
// sempit — masukan (berat, provinsi) dan keluaran (daftar opsi) — supaya bisa
// diganti ke RajaOngkir atau Biteship tanpa mengubah checkout (spec §70).

export type OpsiOngkir = {
  kode: 'kilat' | 'reguler' | 'hemat';
  kurir: string;
  tarif: number;
  estimasi: string;
};

/** Tarif reguler per kg menurut zona. */
const TARIF_REGULER: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 9000,
  2: 12000,
  3: 18000,
  4: 24000,
  5: 35000,
};

const ESTIMASI: Record<OpsiOngkir['kode'], string> = {
  kilat: '1-2 hari',
  reguler: '2-4 hari',
  hemat: '4-7 hari',
};

/**
 * 38 provinsi Indonesia beserta zonanya.
 *   1 = DIY & Jawa Tengah
 *   2 = Jawa lainnya & Bali
 *   3 = Sumatera, NTB
 *   4 = Kalimantan, Sulawesi
 *   5 = NTT, Maluku, Papua
 */
export const PROVINSI: Record<string, 1 | 2 | 3 | 4 | 5> = {
  // Zona 1
  'DI Yogyakarta': 1,
  'Jawa Tengah': 1,
  // Zona 2
  'DKI Jakarta': 2,
  'Jawa Barat': 2,
  'Jawa Timur': 2,
  Banten: 2,
  Bali: 2,
  // Zona 3
  'Nanggroe Aceh Darussalam': 3,
  'Sumatera Utara': 3,
  'Sumatera Barat': 3,
  Riau: 3,
  'Kepulauan Riau': 3,
  Jambi: 3,
  'Sumatera Selatan': 3,
  'Bangka Belitung': 3,
  Bengkulu: 3,
  Lampung: 3,
  'Nusa Tenggara Barat': 3,
  // Zona 4
  'Kalimantan Barat': 4,
  'Kalimantan Tengah': 4,
  'Kalimantan Selatan': 4,
  'Kalimantan Timur': 4,
  'Kalimantan Utara': 4,
  'Sulawesi Utara': 4,
  'Gorontalo': 4,
  'Sulawesi Tengah': 4,
  'Sulawesi Barat': 4,
  'Sulawesi Selatan': 4,
  'Sulawesi Tenggara': 4,
  // Zona 5
  'Nusa Tenggara Timur': 5,
  Maluku: 5,
  'Maluku Utara': 5,
  'Papua Barat': 5,
  'Papua Barat Daya': 5,
  Papua: 5,
  'Papua Selatan': 5,
  'Papua Tengah': 5,
  'Papua Pegunungan': 5,
};

/** Nama kurir tiruan. Kata "Demo" wajib ada agar tidak dikira kurir sungguhan. */
const KURIR_DEMO = 'Demo Express';

/**
 * Bulatkan ke 100 terdekat (pembulatan ke atas), supaya tarif tidak pernah
 * terlihat seperti angka perhitungan mentah.
 */
function bulatkanKe100(nilai: number): number {
  return Math.ceil(nilai / 100) * 100;
}

/**
 * Daftar opsi ongkir untuk satu tujuan.
 *
 * Berat dibulatkan ke atas per kg, minimum 1 kg. `hemat` = 0,8 x reguler dan
 * `kilat` = 1,5 x reguler, masing-masing dibulatkan ke 100 terdekat.
 *
 * @throws Error('provinsi tidak dikenal') bila provinsi di luar daftar.
 */
export function hitungOngkir(i: { beratGram: number; provinsi: string }): OpsiOngkir[] {
  const zona = PROVINSI[i.provinsi];
  if (zona === undefined) {
    throw new Error('provinsi tidak dikenal');
  }

  const kg = Math.max(1, Math.ceil(i.beratGram / 1000));
  const reguler = TARIF_REGULER[zona] * kg;

  return [
    {
      kode: 'kilat',
      kurir: KURIR_DEMO,
      tarif: bulatkanKe100(reguler * 1.5),
      estimasi: ESTIMASI.kilat,
    },
    {
      kode: 'reguler',
      kurir: KURIR_DEMO,
      tarif: reguler,
      estimasi: ESTIMASI.reguler,
    },
    {
      kode: 'hemat',
      kurir: KURIR_DEMO,
      tarif: bulatkanKe100(reguler * 0.8),
      estimasi: ESTIMASI.hemat,
    },
  ];
}

/** Ambil satu opsi berdasarkan kodenya; `null` bila kode tidak ada. */
export function cariOpsi(i: { beratGram: number; provinsi: string }, kode: string): OpsiOngkir | null {
  return hitungOngkir(i).find((opsi) => opsi.kode === kode) ?? null;
}
