/**
 * scripts/db-migrate.ts — menjalankan migrasi skema ke database
 * yang ditunjuk `TURSO_DATABASE_URL`.
 *
 * Pemakaian:
 *   npx tsx scripts/db-migrate.ts          # memakai TURSO_DATABASE_URL
 *   npx tsx scripts/db-migrate.ts :memory: # uji cepat
 *
 * Di Vercel staging, jalankan dengan variabel dari berkas sementara
 * (JANGAN `vercel env pull` ke `.env.local`).
 */

import { bukaDb } from '../src/lib/db/client';
import { migrate } from '../src/lib/db/migrate';

async function utama(): Promise<void> {
  const url = process.argv[2] ?? process.env.TURSO_DATABASE_URL ?? '';
  if (url.trim() === '') {
    console.error('db-migrate: TURSO_DATABASE_URL belum diisi.');
    process.exit(1);
  }

  const db = bukaDb(url);
  try {
    await migrate(db);
    console.log(`db-migrate: migrasi selesai (${url.startsWith('file:') ? url : 'remote'}).`);
  } finally {
    db.close();
  }
}

utama().catch((galat: unknown) => {
  console.error('db-migrate: gagal —', galat instanceof Error ? galat.message : galat);
  process.exit(1);
});
