# RENCANA MIGRASI Fase 1 → Database (Fase 2)

Status: **draft rencana, belum diimplementasikan**
Tanggal: 10 Nov 2026 · Penulis: sesi agent Fase 1
Dasar: PRD §0/§9/§11, HANDOFF §13, kondisi kode aktual (`main` = `b0a20ed`)

> **PENTING:** HANDOFF §13 melarang database di Fase 1. Dokumen ini adalah
> perencanaan Fase 2 — jangan ada satu baris pun dikerjakan sebelum
> Fase 1 go-live dan pemilik produk menyetujui arah di §1.

---

## 0. Masalah yang dipecahkan

PRD §0 baris 11 dan §12 baris 180 menyebut kelemahan yang sama:

> "Konten statis butuh build ulang setiap harga/produk berubah."
> Mitigasi: "Auto-deploy Vercel dari git push (±1 menit). Fase 2: katalog
> dibaca dari DB dengan revalidate/ISR."

Artinya: **hari ini, Bu Aviella tidak bisa mengubah harga sendiri.** Setiap
perubahan harga harus lewat developer → commit → build. Untuk UMKM yang
harganya mengikuti harga kacang, ini tidak berkelanjutan.

Yang diinginkan: Bu Aviella buka HP → ubah harga → simpan → situs berubah
dalam hitungan detik, tanpa developer.

---

## 1. Keputusan yang HARUS diambil sebelum mulai

Gerbang pertama. Jangan tulis kode sebelum ini dijawab.

### 1a. Supabase vs memakai ulang backend Lapakku

PRD §9 baris 148 sudah merumuskan dilemanya:

| | **Opsi A — Supabase (Postgres)** | **Opsi B — Pakai ulang Lapakku** |
|---|---|---|
| Yang dibangun | Skema baru, RLS, admin panel baru | 0 skema, 0 admin panel (sudah ada) |
| Admin panel | Harus dibuat dari nol | Filament sudah jadi |
| Hosting | Vercel (gratis–murah) | **Butuh VPS PHP** (Laravel 13) |
| Biaya | ~$0–25/bln | ~Rp50–150rb/bln VPS |
| Effort | **Besar** (modul pesanan, payment, resi, laporan) | **Kecil** (hanya baca katalog) |
| Hasil akhir | Satu sistem di Next.js | Dua sistem, API di antaranya |
| Risiko | RLS salah → data bocor | Dua codebase, dua deploy, sinkronisasi |

> ### KEPUTUSAN — 10 Nov 2026
> **Opsi A: Supabase (PostgreSQL) dipilih.** Alasan: tidak ada anggaran VPS.
> Laravel tidak bisa di-host di Vercel, jadi memakai ulang backend Lapakku
> tidak realistis secara biaya.
>
> Konsekuensi yang harus disadari: **modul pesanan, payment, dan resi Lapakku
> tidak ikut terbawa.** Kalau nanti Fase 2 penuh dijalankan, modul-modul itu
> harus dibangun ulang di Next.js + Supabase. Migrasi pada dokumen ini
> **hanya mencakup katalog produk** (§8), bukan sistem pesanan.

Rekomendasi awal saya adalah Opsi B (pakai ulang Lapakku) karena Lapakku sudah
punya Filament CRUD dan modul `orders`/`payments`/`shipments` yang siap pakai.
Opsi itu gugur karena kendala biaya VPS. Dokumen ini sekarang mengikuti
**Opsi A**.

### 1b. Siapa yang menulis katalog?

Dengan Opsi A: perlu tabel + RLS + antarmuka edit (§8.3).

**Peringatan penting — ada risiko dua sumber kebenaran.** Kalau Lapakku masih
dipakai untuk menerima pesanan (dan harga tercatat di sana) sementara harga
katalog pindah ke Supabase, kedua sistem bisa **menyimpang**: pembeli melihat
Rp15.000 di landing page tapi Rp16.000 di Lapakku. Perlu diputuskan lebih dulu:

- **Jika Lapakku berhenti dipakai** → Supabase jadi satu-satunya sumber, aman.
- **Jika Lapakku tetap dipakai** → harga harus tetap satu sumber. Pilih: (a)
  jangan taruh `harga` di Supabase, cukup di Lapakku; atau (b) bangun
  sinkronisasi Lapakku → Supabase. Opsi (b) menambah kerja yang tidak kecil.

Ini belum dijawab dan **harus dijawab sebelum T4.**

### 1c. Apakah Fase 1 harus lebih dulu go-live?

**Ya, dan ini wajib.** Fase 1 belum live (masih ada placeholder harga). Migrasi
DB sebelum Fase 1 live berarti membangun di atas fondasi yang belum terbukti.
Urutannya: **Fase 1 live → kumpulkan data klik WA 2–4 minggu → baru migrasi.**

---

## 2. Kondisi kode saat ini (hasil audit)

### 2a. Titik impor — inilah biaya migrasinya

```
@/data/site      → 15 file mengimpor
@/data/products  →  5 file mengimpor
@/data/sambal    →  1 file
@/data/testimoni →  1 file
@/data/faq       →  1 file (JsonLd)
```


### 2b. Tiga hambatan teknis yang harus dipecahkan

**Hambatan 1 — `site` dan `produk` dipakai di level modul (sinkron).**

`src/app/layout.tsx` baris 23:
```ts
const judul = `Rempeyek Kacang Renyah Bu Aviella – ${site.kota ?? '[KOTA]'} | Pesan WA`;
export const metadata: Metadata = { title: judul, ... };
```
Ini **sinkron, saat modul dievaluasi**. Begitu `site` datang dari DB (async),
ini tidak bisa dipakai lagi. Harus jadi:
```ts
export async function generateMetadata(): Promise<Metadata> { ... }
```
Sama untuk `opengraph-image.tsx` (baris 68) dan `sitemap.ts` (baris 8).

**Hambatan 2 — `next/font/google` + DB = build butuh jaringan.**

Kalau metadata jadi async dan build memanggil DB, build Vercel bergantung pada
2 layanan eksternal (Google Fonts + DB). Kita **sudah** melihat build gagal
acak karena Google Fonts (`TypeError: Cannot read properties of null`).
Sebelum DB ditambahkan, font **wajib** di-self-host (`next/font/local`) supaya
build hanya bergantung pada DB.

**Hambatan 3 — `dangerouslySetInnerHTML` di JsonLd.tsx baris 90.**

Data dari DB masuk ke JSON-LD lewat `JSON.stringify` → `dangerouslySetInnerHTML`.
Selama data masih file statis ini aman (kode kita sendiri). Begitu data dapat
diubah dari admin panel, ini jadi **jalur injection**: `JSON.stringify` tidak
meng-escape `</script>`. Wajib di-escape:
```ts
JSON.stringify(blok).replace(/</g, '\\u003c')
```

### 2c. Yang TIDAK perlu dipindah ke DB

Temuan bagus: `src/lib/whatsapp.ts` baris 15 sudah menerima nomor sebagai
**parameter**, bukan mengambil dari modul:
```ts
export function buildWaLink(nomor: string | null, pesan: string): string
```
Jadi nomor WA tidak perlu ikut ke DB. Biarkan di env — itu memang tempatnya
(rahasia, tidak berubah-ubah).

**Yang tetap di file statis:**
- `faq.ts` — jarang berubah, idealnya dikurasi developer
- `site.legalitas` — menyangkut dokumen hukum, harus lewat review
- Semua teks section (headline, WhyUs) — bagian desain, bukan katalog

---

## 3. Strategi: pola Repository + ISR

Jangan langsung ganti 15 impor. Pakai pola yang bisa dibalik.

### 3a. Bikin lapisan akses data

```ts
// src/lib/katalog.ts  (BARU)
import { produk as produkStatis } from '@/data/products';

// Tahap 1: masih baca file — situs berperilaku persis seperti sekarang.
// Tahap 2: ganti isi fungsi ini saja; 15 impor di komponen TIDAK berubah.
export async function getProduk(): Promise<Produk[]> {
  return produkStatis;
}
```

Komponen tinggal ganti `import { produk }` → `await getProduk()`. Saat migrasi
DB, **hanya `katalog.ts` yang diubah**. Ini menekan risiko dari 15 file jadi 1.

### 3b. Urutan rilis yang aman

| Tahap | Isi | Tampilan berubah? |
|---|---|---|
| **T1** | Tambah `katalog.ts` (masih baca file) + `generateMetadata()` | Tidak |
| **T2** | Self-host font (`next/font/local`) | Tidak |
| **T3** | Escape JSON-LD | Tidak |
| **T4** | Ganti isi `katalog.ts` → baca API/DB + `revalidate` | Ya, sumber data |
| **T5** | Pindah `site` (jam, alamat) ke DB bila perlu | Ya |

T1–T3 adalah **persiapan yang tidak mengubah tampilan**. Bisa dikerjakan
sekarang tanpa menunggu keputusan §1, dan tidak melanggar HANDOFF §13 karena
belum ada DB sama sekali.

### 3c. ISR, bukan SSR

HANDOFF §2 mengunci **SSG** dan melarang `"use client"` di level page — alasan
utamanya SEO: konten harus ada di HTML hasil build.

Migrasi DB **tidak boleh** mengubahnya jadi SSR murni. Pakai **ISR**:

```ts
// src/app/page.tsx
export const revalidate = 300; // 5 menit
```

Hasilnya: HTML tetap statis & cepat (Lighthouse 98 tidak jatuh), tapi
diperbarui berkala. Bu Aviella ubah harga → maksimal 5 menit kemudian situs
ikut berubah, **tanpa build ulang, tanpa developer**. Ini persis yang PRD §0
minta ("revalidate/ISR").

Bisa juga on-demand: webhook dari Lapakku memanggil `revalidatePath('/')`
sehingga perubahan langsung tampak. Ini paling ideal — tapi T4+.

---

## 4. Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| DB down → build gagal | Situs tidak bisa deploy | Fallback ke data statis terakhir; build tidak boleh keras gagal |
| DB down saat runtime | Halaman error | ISR: HTML lama tetap disajikan |
| RLS salah (kalau Supabase) | Data internal bocor | Hanya kolom katalog yang di-expose |
| `dangerouslySetInnerHTML` + data DB | XSS | Escape `</` → `\u003c` (Hambatan 3) |
| Build butuh jaringan | Gagal acak (sudah kejadian) | Self-host font (Hambatan 2) |
| Harga salah input di admin | Kredibilitas | Tampilkan harga di panel; cek berkala |
| Biaya VPS | Beban Bu Aviella | Evaluasi Opsi A kalau tidak ada anggaran |
| Dua codebase (Opsi B) | Sulit dirawat | Dokumentasikan endpoint + kontrak field |
| `docs/` ter-gitignore | Rencana ini tak terbaca | Lihat P3-1 di brief task |

**Catatan penting soal fallback:** kegagalan DB **tidak boleh** menggagalkan
build produksi. Kalau Lapakku down saat Vercel build, situs harus tetap terbit
dengan data terakhir yang dikenal. Ini mencegah "situs hilang karena server
lain mati".

---

## 5. Definition of Done

Migrasi dianggap selesai kalau:

- [ ] Bu Aviella bisa ubah harga di panel admin **tanpa** menyentuh kode/git
- [ ] Perubahan tampil di situs **≤ 5 menit** tanpa deploy
- [ ] Lighthouse mobile Performance **tetap ≥ 90** (HANDOFF §11)
- [ ] Konten produk **tetap ada di HTML hasil build** (`view-source`, §11)
- [ ] Build produksi **tetap** gagal jika katalog kosong/rusak
- [ ] DB down → situs tetap tampil dengan data terakhir
- [ ] Nol `dangerouslySetInnerHTML` tanpa escape
- [ ] `check-placeholders.ts` diperbarui: validasi katalog dari DB, bukan file
- [ ] Tidak ada field internal yang bocor ke client

---

## 6. Yang jangan dilakukan

- **Jangan** kerjakan sebelum Fase 1 go-live (§1c)
- **Jangan** ubah `output: 'export'` (HANDOFF §2) — sudah benar tidak dipakai
- **Jangan** pindahkan `faq`, `legalitas`, atau teks desain ke DB (§2c)
- **Jangan** pindahkan nomor WA ke DB — sudah di env, memang tempatnya (§2c)
- **Jangan** ganti SSG → SSR murni; pakai ISR (§3c)
- **Jangan** ganti Bricolage Grotesque / Plus Jakarta Sans (HANDOFF §2)
- **Jangan** bangun ulang modul pesanan/payment/resi di Next.js kalau Lapakku
  sudah punya (§1a)

---

## 7. Langkah berikutnya

**Sudah diputuskan:** Opsi A — Supabase (Postgres). Lihat blok keputusan di §1a.

**Bisa dikerjakan sekarang (belum ada DB, tidak melanggar HANDOFF §13):**
T1 (lapisan `katalog.ts`), T2 (self-host font), T3 (escape JSON-LD).

**Butuh jawaban sebelum T4:**
1. Apakah Lapakku berhenti dipakai? (§1b — risiko dua sumber harga)
2. Siapa yang jadi admin katalog — Bu Aviella sendiri, atau dibantu?

**Butuh Fase 1 live dulu:**
T4, T5.

**Desain teknis Supabase:** §8.

---

## 8. Desain teknis Supabase (Opsi A)

### 8a. Skema tabel

Nama field **wajib sama** dengan `Produk` di `src/data/products.ts` — HANDOFF
§4 baris 60 sudah menetapkan konvensi ini supaya migrasi lurus.

```sql
create table produk (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  nama          text not null,
  deskripsi_singkat text not null,
  harga         integer,          -- null = belum diisi
  harga_coret   integer,
  berat_gram    integer,
  gambar        text[] default '{}',
  status        text not null check (status in ('tersedia','po','habis')),
  warna_isian   text not null,
  urutan        integer default 0,      -- baru: atur urutan tampil
  aktif         boolean default true,   -- baru: soft delete, jangan hapus baris
  diperbarui_pada timestamptz default now()
);
```

Dua kolom baru yang tidak ada di file statis:
- `urutan` — supaya urutan varian bisa diatur tanpa ubah kode
- `aktif` — supaya varian bisa disembunyikan tanpa dihapus (riwayat pesanan
  lama tetap merujuk barisnya)

### 8b. RLS — bagian paling rawan

PRD §9 baris 150: *"RLS Supabase aktif di semua tabel."* Untuk tabel katalog,
aturannya sederhana tapi harus tepat:

```sql
alter table produk enable row level security;

-- Publik hanya boleh MEMBACA baris aktif.
create policy "katalog publik baca" on produk
  for select using (aktif = true);

-- Tulis hanya untuk yang sudah login (admin).
create policy "admin boleh tulis" on produk
  for all to authenticated using (true) with check (true);
```

**Tiga hal yang mudah salah dan berbahaya:**

1. **Jangan pakai `service_role` key di client.** Key itu melewati RLS
   sepenuhnya. Hanya boleh dipakai di server (route handler), dan hanya kalau
   benar-benar perlu menulis. Untuk membaca katalog, cukup `anon` key.

2. **Pisahkan kolom publik dan internal.** Kalau nanti ada kolom seperti
   `harga_grosir` atau `catatan_internal`, jangan di kolom yang sama dengan
   yang dibaca publik lalu berharap RLS menyaring per-kolom. RLS bekerja
   per-**baris**, bukan per-kolom. Buat tabel/kolom terpisah atau view.

3. **`anon` key memang publik** (ikut ter-bundle ke browser). Itu normal dan
   aman **asal RLS benar**. Jangan panik lalu menandainya sebagai rahasia —
   sama seperti `NEXT_PUBLIC_WA_NUMBER` yang sudah kita kerjakan.

### 8c. Antarmuka edit untuk Bu Aviella

Supabase punya Table Editor bawaan di dashboard. Untuk 4–8 varian, ini sudah
cukup — **tidak perlu membangun admin panel**.

Tapi ada satu syarat: editor bawaan Supabase menampilkan kolom teknis (`id`,
`slug`, `urutan`, `aktif`) yang membingungkan orang non-teknis. Dua pilihan:

- **Minimal (disarankan):** pakai Table Editor apa adanya + buat **satu
  halaman panduan bergambar** untuk Bu Aviella (cara ubah kolom `harga`).
  Biaya: 0 baris kode.
- **Lebih nyaman:** bangun route `/admin` kecil di Next.js dengan Supabase
  Auth. Biaya: route baru + halaman login + form. Ini **melanggar semangat
  HANDOFF §13** (admin panel = Fase 2), jadi hanya kalau benar-benar perlu.

### 8d. Dua pilihan cara membaca

| | **Baca langsung (client lib)** | **Lewat API route** |
|---|---|---|
| Paket | `@supabase/supabase-js` | sama |
| Key dipakai | `anon` (publik, aman) | `anon` juga, tapi di server |
| RLS | Wajib benar | Wajib benar |
| Kelebihan | Lebih sedikit kode | Bisa cache & filter kolom di server |
| Kekurangan | Query bocor ke client | Sedikit lebih banyak file |

**Rekomendasi: API route.** Alasannya bukan keamanan, tapi **kontrol** — kita
bisa memilih kolom yang dikirim, dan `revalidatePath('/')` bisa dipanggil dari
satu tempat. Lebih mudah diaudit.

### 8e. Variabel lingkungan baru

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Keduanya **memang publik** (prefix `NEXT_PUBLIC_`). Yang **tidak boleh** masuk
`NEXT_PUBLIC_`:

```
SUPABASE_SERVICE_ROLE_KEY   ← hanya server, jangan pernah NEXT_PUBLIC_
```

Untuk T4 (baca katalog saja), service role **tidak dibutuhkan sama sekali**.

### 8f. Lapisan akses data (bentuk kode)

Ini pengganti isi `katalog.ts` pada T1. Perhatikan tiga hal: **fallback**,
**cache**, dan **pemetaan tipe**.

```ts
// src/lib/katalog.ts
import { produk as produkStatis } from '@/data/products';

export async function getProduk(): Promise<Produk[]> {
  // Tidak ada kredensial (mis. lokal tanpa .env) → pakai file.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return produkStatis;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/produk` +
        `?select=*&aktif=eq.true&order=urutan.asc`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 300 }, // ISR: 5 menit
      },
    );
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    return (await res.json()) as Produk[];
  } catch (err) {
    // DB mati TIDAK boleh membuat situs gagal terbit (§4).
    console.error('katalog: fallback ke data statis', err);
    return produkStatis;
  }
}
```

Catatan penting:
- **Tanpa `@supabase/supabase-js`.** Untuk satu query `GET`, cukup `fetch`.
  Ini menghindari menambah dependensi ke bundle sama sekali. Paket baru hanya
  perlu kalau nanti memakai Auth (untuk `/admin`).
- **`next: { revalidate: 300 }`** memberi ISR di level fetch, lebih presisi
  daripada `export const revalidate` di page.
- **Fallback wajib.** Inilah yang mencegah "situs hilang karena Supabase down".

### 8g. Langkah eksekusi T4 (urut)

```
1. Buat project Supabase (region Singapore — terdekat ke Indonesia)
2. Jalankan skema §8a + RLS §8b di SQL Editor
3. Isi data awal dari src/data/products.ts (seed manual, 4 baris)
4. Tambah env §8e di Vercel (Production + Preview) dan .env.local
5. Tambah .env.example: dua variabel baru, nilai dikosongkan
6. Ganti isi src/lib/katalog.ts mengikuti §8f
7. Build lokal → pastikan harga muncul dari DB, bukan file
8. Deploy Preview → cek harga di HTML (view-source), bukan fetch client
9. Ukur Lighthouse → Performance harus tetap >= 90
10. Uji fallback: matikan URL Supabase → situs harus tetap tampil
11. Baru arahkan domain / go-live
```

**Langkah 10 jangan dilewati.** Itu satu-satunya cara membuktikan risikonya
tertangani sebelum pengunjung yang menemukannya.

### 8h. Verifikasi

```bash
# 1. Harga benar-benar dari DB, bukan file
curl -s https://DOMAIN/ | grep -o 'Rp[0-9.]*' | head

# 2. Konten ada di HTML hasil build (HANDOFF §11)
curl -s https://DOMAIN/ | grep -c 'Rempeyek Kacang Tanah'

# 3. noindex tetap aktif di Preview
curl -sI https://PREVIEW/ | grep -i x-robots-tag

# 4. Fallback: ubah URL jadi invalid, situs harus tetap 200
```

---

## 9. Ringkasan keputusan

| Hal | Keputusan |
|---|---|
| Backend | **Supabase (Postgres)** — tidak ada anggaran VPS |
| Yang dimigrasi | **Katalog produk saja** (§8a) |
| Yang tetap di file | `site`, `faq`, `sambal`, teks desain |
| Nomor WA | Tetap di env, **tidak** ke DB |
| Rendering | **ISR 300 detik**, bukan SSR |
| Admin | Table Editor Supabase + panduan (tanpa admin panel) |
| Fallback | Data statis bila DB gagal |
| Prasyarat | T1–T3 selesai, Fase 1 sudah live |
