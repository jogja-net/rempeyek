// src/lib/laju.test.ts
//
// Tes Task 4: pembatas laju berbasis tabel `batas_laju`.
//
// Kontrak dari rencana:
//   cekBatas(db, 'k', 3, 60, t) → true, true, true, false
//   pada t + 61000 → true lagi (catatan lama dibersihkan)
//
// Catatan: fungsi ini MENCATAT percobaan saat mengizinkan, jadi tiga panggilan
// pertama memenuhi kuota, dan panggilan keempat ditolak.

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import type { Client } from '@libsql/client';

import { bukaDb } from './db/client';
import { migrate } from './db/migrate';
import { cekBatas } from './laju';

describe('cekBatas', () => {
  let db: Client;
  const t = Date.UTC(2026, 10, 12, 3, 0, 0);

  before(async () => {
    db = bukaDb(':memory:');
    await migrate(db);
  });

  after(() => {
    db.close();
  });

  it('mengizinkan tepat sebanyak batas, lalu menolak', async () => {
    assert.equal(await cekBatas(db, 'k', 3, 60, t), true);
    assert.equal(await cekBatas(db, 'k', 3, 60, t), true);
    assert.equal(await cekBatas(db, 'k', 3, 60, t), true);
    assert.equal(await cekBatas(db, 'k', 3, 60, t), false);
  });

  it('mengizinkan lagi setelah jendela waktu lewat', async () => {
    assert.equal(await cekBatas(db, 'k', 3, 60, t + 61_000), true);
  });

  it('kunci berbeda punya kuota sendiri', async () => {
    assert.equal(await cekBatas(db, 'lain', 1, 60, t), true);
    assert.equal(await cekBatas(db, 'lain', 1, 60, t), false);
    assert.equal(await cekBatas(db, 'k', 3, 60, t + 61_000), true);
  });

  it('maks 0 selalu menolak', async () => {
    assert.equal(await cekBatas(db, 'nol', 0, 60, t), false);
  });

  it('membersihkan catatan lama dari tabel', async () => {
    await cekBatas(db, 'bersih', 10, 60, t);
    await cekBatas(db, 'bersih', 10, 60, t + 61_000);

    const hasil = await db.execute({
      sql: 'SELECT COUNT(*) AS jumlah FROM batas_laju WHERE kunci = ?',
      args: ['bersih'],
    });
    assert.equal(Number(hasil.rows[0].jumlah), 1);
  });
});
