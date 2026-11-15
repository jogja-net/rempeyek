// src/lib/admin-auth.test.ts
//
// Tes Task 6: verifikasi kata sandi dan token sesi admin.
//
// Keduanya fungsi murni `node:crypto` — tidak ada database, tidak ada cookie.
// Yang diuji adalah hal-hal yang, kalau salah, membuka panel admin ke publik:
//   1. Hash harus memakai pembandingan waktu-tetap, dan hash yang rusak harus
//      menghasilkan `false` — bukan lemparan yang bisa jadi 500.
//   2. Token harus terikat pada rahasia server: mengubah satu karakter saja
//      sudah cukup untuk menolaknya.
//   3. Token kedaluwarsa tepat setelah umurnya lewat.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buatHashPassword, buatToken, tokenSah, verifikasiPassword } from './admin-auth';

const RAHASIA = 'rahasia';
const HASH = buatHashPassword(RAHASIA, '00112233445566778899aabbccddeeff');

describe('verifikasiPassword', () => {
  it('menerima kata sandi yang benar', () => {
    assert.equal(verifikasiPassword(RAHASIA, HASH), true);
  });

  it('menolak kata sandi dengan huruf besar/kecil berbeda', () => {
    assert.equal(verifikasiPassword('Rahasia', HASH), false);
  });

  it('menolak kata sandi kosong', () => {
    assert.equal(verifikasiPassword('', HASH), false);
  });

  it('menolak hash berformat rusak tanpa melempar', () => {
    for (const rusak of ['', 'abc', 'scrypt', 'scrypt$', 'scrypt$abc', 'bcrypt$aa$bb', '$$$']) {
      assert.equal(verifikasiPassword(RAHASIA, rusak), false, `hash "${rusak}"`);
    }
  });

  it('menolak hash dengan panjang digest tidak wajar', () => {
    // Salt sah, tetapi digest hanya 4 bit — tidak mungkin hasil scrypt 64 byte.
    assert.equal(verifikasiPassword(RAHASIA, 'scrypt$00112233$aabb'), false);
  });

  it('menolak salt yang bukan hex', () => {
    const hash = HASH.split('$');
    assert.equal(verifikasiPassword(RAHASIA, `scrypt$zzzz$${hash[2]}`), false);
  });

  it('hash dari salt berbeda tidak saling cocok', () => {
    const lain = buatHashPassword(RAHASIA, 'ffeeddccbbaa99887766554433221100');
    assert.notEqual(lain, HASH);
    assert.equal(verifikasiPassword(RAHASIA, lain), true);
  });
});

describe('buatToken / tokenSah', () => {
  const SECRET = 'rahasia-sesi-uji';
  const T0 = Date.UTC(2026, 10, 12, 3, 0, 0);
  const DUA_BELAS_JAM = 12 * 60 * 60 * 1000;

  it('token yang baru dibuat sah pada saat itu', () => {
    assert.equal(tokenSah(buatToken(SECRET, T0), SECRET, T0), true);
  });

  it('masih sah tepat pada batas umur', () => {
    const token = buatToken(SECRET, T0);
    assert.equal(tokenSah(token, SECRET, T0 + DUA_BELAS_JAM), true);
  });

  it('kedaluwarsa satu milidetik setelah batas umur', () => {
    const token = buatToken(SECRET, T0);
    assert.equal(tokenSah(token, SECRET, T0 + DUA_BELAS_JAM + 1), false);
  });

  it('menolak token bila rahasianya berbeda', () => {
    const token = buatToken(SECRET, T0);
    assert.equal(tokenSah(token, 'rahasia-lain', T0), false);
  });

  it('menolak token yang satu karakternya diubah', () => {
    const token = buatToken(SECRET, T0);
    const akhir = token.slice(-1);
    const diubah = `${token.slice(0, -1)}${akhir === 'a' ? 'b' : 'a'}`;
    assert.notEqual(diubah, token);
    assert.equal(tokenSah(diubah, SECRET, T0), false);
  });

  it('menolak token yang umurnya dipanjangkan sendiri', () => {
    const token = buatToken(SECRET, T0);
    const [terbit, tanda] = token.split('.');
    const dipalsukan = `${Number(terbit) + 60 * 60 * 1000}.${tanda}`;
    assert.equal(tokenSah(dipalsukan, SECRET, T0), false);
  });

  it('menolak undefined, string kosong, dan bentuk rusak', () => {
    assert.equal(tokenSah(undefined, SECRET, T0), false);
    assert.equal(tokenSah('', SECRET, T0), false);
    assert.equal(tokenSah('abc', SECRET, T0), false);
    assert.equal(tokenSah('abc.def.ghi', SECRET, T0), false);
  });

  it('umur khusus dihormati', () => {
    const token = buatToken(SECRET, T0, 1000);
    assert.equal(tokenSah(token, SECRET, T0 + 1000), true);
    assert.equal(tokenSah(token, SECRET, T0 + 1001), false);
  });

  it('dua token pada detik berbeda tidak identik', () => {
    assert.notEqual(buatToken(SECRET, T0), buatToken(SECRET, T0 + 1));
  });
});
