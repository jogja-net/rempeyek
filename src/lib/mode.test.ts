// src/lib/mode.test.ts
//
// Tes Task 2: penjaga mode marketplace.
//
// Aturan (Global Constraints): fitur marketplace mati di produksi, dan juga
// mati bila database tidak dikonfigurasi. Dua syarat itu harus berlaku
// bersamaan, bukan salah satu.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { marketplaceAktif } from './mode';

describe('marketplaceAktif', () => {
  it('false bila VERCEL_ENV=production, walau database ada', () => {
    assert.equal(marketplaceAktif({ VERCEL_ENV: 'production', TURSO_DATABASE_URL: 'libsql://x' }), false);
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
