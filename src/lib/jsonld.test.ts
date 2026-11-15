// src/lib/jsonld.test.ts
//
// JSON-LD dipasang di dalam <script>. Teks produk berasal dari database (diisi admin),
// jadi "</script>" di dalamnya tidak boleh bisa menutup tag lebih awal.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { serialisasiJsonLd } from './jsonld';

describe('serialisasiJsonLd', () => {
  it('tidak menghasilkan karakter "<" mentah', () => {
    const hasil = serialisasiJsonLd({ name: 'Peyek </script><script>alert(1)</script>' });
    assert.equal(hasil.includes('<'), false);
    assert.equal(hasil.includes('</script>'), false);
  });

  it('hasilnya tetap JSON yang sama bila diurai kembali', () => {
    const asli = { name: 'A < B & C > D', n: 3, ok: true, daftar: ['</x>'] };
    assert.deepEqual(JSON.parse(serialisasiJsonLd(asli)), asli);
  });

  it('juga meng-escape pemisah baris Unicode yang bisa merusak skrip', () => {
    const hasil = serialisasiJsonLd({ t: 'a b c' });
    assert.equal(hasil.includes(' '), false);
    assert.equal(hasil.includes(' '), false);
  });
});
