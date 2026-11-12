// src/lib/slug.test.ts
//
// Tes Task 2: pembuatan slug produk yang unik.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buatSlug } from './slug';

describe('buatSlug', () => {
  it('mengubah nama jadi huruf kecil bertanda hubung', () => {
    assert.equal(buatSlug('Rempeyek Kacang Tanah', []), 'rempeyek-kacang-tanah');
  });

  it('menambahkan akhiran -2 lalu -3 bila slug sudah dipakai', () => {
    assert.equal(buatSlug('Rempeyek Kacang Tanah', ['rempeyek-kacang-tanah']), 'rempeyek-kacang-tanah-2');
    assert.equal(
      buatSlug('Rempeyek Kacang Tanah', ['rempeyek-kacang-tanah', 'rempeyek-kacang-tanah-2']),
      'rempeyek-kacang-tanah-3',
    );
  });

  it('merapikan spasi ganda dan membuang tanda baca', () => {
    assert.equal(buatSlug('  Sambal  Bawang!! ', []), 'sambal-bawang');
  });

  it('nama tanpa huruf/angka memakai cadangan "produk"', () => {
    assert.equal(buatSlug('???', []), 'produk');
  });

  it('membuang aksen huruf', () => {
    assert.equal(buatSlug('Crème Brûlée', []), 'creme-brulee');
  });
});
