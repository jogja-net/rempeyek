# Landing Page Rempeyek Bu Aviella

Landing page statis (SSG) untuk UMKM rempeyek Bu Aviella. Next.js App Router + TypeScript + Tailwind CSS v4.

Sumber kebenaran implementasi: `docs/HANDOFF-landing-bu-aviella.md` (dan `docs/PRD landing page bu aviella.md`).

## Menjalankan lokal

```bash
npm install
npm run dev        # http://localhost:3000
```

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi (menjalankan `prebuild` lebih dulu) |
| `npm run start` | Menjalankan hasil build |
| `npm run typecheck` | Cek tipe tanpa emit |
| `npx tsx scripts/check-placeholders.ts` | Cek data placeholder secara manual |

## Environment variables

| Key | Production | Preview |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | domain final | boleh kosong / URL preview |
| `NEXT_PUBLIC_WA_NUMBER` | nomor asli `62…` | boleh nomor tes |

## Data yang masih menunggu Bu Aviella

Semua nilai `null` dirender sebagai placeholder yang terlihat jelas (`[HARGA]`, `[BERAT]`, `[KOTA]`, …).
Daftar lengkap ada di HANDOFF §12. `scripts/check-placeholders.ts` menggagalkan **build produksi**
selama data wajib masih kosong, tetapi build Preview tetap berjalan.

## Staging & indexing

Saat `VERCEL_ENV !== 'production'`:

- `robots.txt` → `Disallow: /`
- Header `X-Robots-Tag: noindex` untuk semua path
- `<meta name="robots">` → `noindex, nofollow`

Ini mencegah halaman staging/review terindeks Google sebelum data final siap.

## Catatan penting soal testimoni

`src/data/testimoni.ts` untuk saat ini berisi **contoh berlabel** (field `contoh: true`), dipakai
karena review staging masih menunggu kutipan asli dari Bu Aviella. Selama `contoh: true`:

- kartu menampilkan label "Contoh — menunggu testimoni asli",
- **build produksi digagalkan** oleh `check-placeholders.ts`.

HANDOFF §7.8 dan PRD §5 #9 mewajibkan hanya testimoni asli (dengan izin) yang tampil.
Cara mengganti tertera sebagai komentar di dalam file tersebut.
