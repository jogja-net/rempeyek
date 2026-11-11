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

## URL staging di Vercel

| Lingkungan | URL | Keterangan |
|---|---|---|
| Preview (branch `staging`) | `https://rempeyek-preview.vercel.app` | Domain cabang. Ikut berpindah otomatis setiap ada push ke `staging`. |
| Preview (alias bawaan Vercel) | `rempeyek-git-staging-…vercel.app` | Dibuat otomatis Vercel, memuat "staging" di URL. |
| Produksi (branch `main`) | `https://rempeyek.vercel.app` | Mengembalikan 404 selama build produksi masih digagalkan data kosong. |

Deployment Protection (Vercel Authentication) dimatikan supaya link staging bisa dibuka
pemilik UMKM tanpa akun Vercel. Karena itu `robots.txt` (`Disallow: /`), header
`X-Robots-Tag: noindex`, dan `<meta name="robots" content="noindex, nofollow">` wajib tetap
aktif selama `VERCEL_ENV !== 'production'`.

Variabel `NEXT_PUBLIC_SITE_URL` untuk Preview diisi `https://rempeyek-preview.vercel.app`
(khusus branch `staging`) agar `canonical`, `og:url`, dan `sitemap.xml` menunjuk domain preview,
bukan `localhost:3000`.

## Catatan penting soal testimoni

`src/data/testimoni.ts` untuk saat ini berisi **contoh berlabel** (field `contoh: true`), dipakai
karena review staging masih menunggu kutipan asli dari Bu Aviella. Selama `contoh: true`:

- kartu menampilkan label "Contoh — menunggu testimoni asli",
- **build produksi digagalkan** oleh `check-placeholders.ts`.

HANDOFF §7.8 dan PRD §5 #9 mewajibkan hanya testimoni asli (dengan izin) yang tampil.
Cara mengganti tertera sebagai komentar di dalam file tersebut.
