// src/lib/mode.test.ts
//
// Tes Task 2: penjaga mode marketplace.
//
// Aturan: fitur marketplace hidup bila database dikonfigurasi, termasuk di
// produksi (keputusan pemilik 15 Nov 2026), dan mati bila database kosong.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { marketplaceAktif } from './mode';

describe('marketplaceAktif', () => {
  it('true di produksi bila database ada', () => {
    assert.equal(marketplaceAktif({ VERCEL_ENV: 'production', TURSO_DATABASE_URL: 'libsql://x' }), true);
  });

  it('false di produksi bila database tidak ada', () => {
    assert.equal(marketplaceAktif({ VERCEL_ENV: 'production' }), false);
  });

  it('true bila database ada dan VERCEL_ENV bukan production', () => {
    assert.equal(marketplaceAktif({ TURSO_DATABASE_URL: 'libsql://x' }), true);
  });

  it('false bila database tidak ada, walau bukan production', () => {
    assert.equal(marketplaceAktif({ VERCEL_ENV: 'preview' }), false);
  });

  it('true di preview bila database ada', () => {
    assert.equal(marketplaceAktif({ VERCEL_ENV: 'preview', TURSO_DATABASE_URL: 'file:local.db' }), true);
  });

  it('false untuk lingkungan kosong', () => {
    assert.equal(marketplaceAktif({}), false);
  });

  it('false bila TURSO_DATABASE_URL hanya berisi spasi', () => {
    assert.equal(marketplaceAktif({ TURSO_DATABASE_URL: '   ' }), false);
  });
});
