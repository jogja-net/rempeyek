// src/lib/db/client.test.ts

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bukaDb } from './client';

describe('bukaDb', () => {
  it('memakai URL yang diberikan secara eksplisit', async () => {
    const db = bukaDb(':memory:');
    const hasil = await db.execute('SELECT 1 AS satu');
    assert.equal(Number(hasil.rows[0].satu), 1);
    db.close();
  });

  it('memakai TURSO_DATABASE_URL dari env', async () => {
    const lama = process.env.TURSO_DATABASE_URL;
    process.env.TURSO_DATABASE_URL = ':memory:';
    try {
      const db = bukaDb();
      const hasil = await db.execute('SELECT 2 AS dua');
      assert.equal(Number(hasil.rows[0].dua), 2);
      db.close();
    } finally {
      if (lama === undefined) delete process.env.TURSO_DATABASE_URL;
      else process.env.TURSO_DATABASE_URL = lama;
    }
  });

  it('melempar Error dengan pesan Indonesia bila URL kosong', () => {
    const lama = process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_DATABASE_URL;
    try {
      assert.throws(() => bukaDb(''), /TURSO_DATABASE_URL belum diisi/);
      assert.throws(() => bukaDb(), /TURSO_DATABASE_URL belum diisi/);
    } finally {
      if (lama === undefined) delete process.env.TURSO_DATABASE_URL;
      else process.env.TURSO_DATABASE_URL = lama;
    }
  });
});
