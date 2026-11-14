'use client';

// src/components/TombolCetak.tsx — satu-satunya bagian halaman resi yang butuh JS.

export default function TombolCetak() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl bg-cabai px-5 py-3 text-sm font-semibold text-kertas transition-colors hover:bg-cabai-tua"
    >
      Cetak
    </button>
  );
}
