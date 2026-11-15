// src/lib/db/migrate.ts

import type { Client } from '@libsql/client';

import { PERNYATAAN_SKEMA } from './schema';

/**
 * Menjalankan skema marketplace. Idempoten: aman dipanggil berulang
 * (semua statement memakai `IF NOT EXISTS`).
 *
 * @param db Klien database (Turso, `file:local.db`, atau `:memory:` di tes).
 */
export async function migrate(db: Client): Promise<void> {
  await db.batch(PERNYATAAN_SKEMA, 'write');
}
