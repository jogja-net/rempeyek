# Font self-host

Kedua berkas di folder ini dipakai lewat `next/font/local` di `src/app/layout.tsx`.

| Berkas | Keluarga | Berat | Subset | Lisensi |
|---|---|---|---|---|
| `bricolage-grotesque-latin.woff2` | Bricolage Grotesque | variable 200–800 | latin | SIL Open Font License 1.1 |
| `plus-jakarta-sans-latin.woff2` | Plus Jakarta Sans | variable 200–800 | latin | SIL Open Font License 1.1 |

Keduanya variable font, jadi satu berkas sudah mencakup seluruh berat yang dipakai
(Bricolage 500–800 untuk judul, Plus Jakarta Sans 400–700 untuk badan — HANDOFF §6).

## Kenapa tidak pakai `next/font/google`

HANDOFF §2 menyebut `next/font/google`. Setelah dipakai, build produksi gagal dengan:

```
An error occurred in `next/font`.
TypeError: Cannot read properties of null (reading '1')
    at @next/font/dist/google/loader.js:122:78
```

Error yang sama muncul di lokal maupun di Vercel, dan pernah menggagalkan satu
deployment Preview. Karena build produksi harus deterministik (tidak boleh bergantung
pada layanan luar saat build), font di-self-host. Perubahan ini disetujui pemilik repo.

## Cara memperbarui berkas font

```bash
curl -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' \
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@200..800&display=swap'
```

Ambil URL `format('woff2')` pada blok `/* latin */`, unduh, lalu simpan dengan nama yang
sama. Setelah mengganti berkas, jalankan `npm run build` untuk memastikan build tetap lolos.
