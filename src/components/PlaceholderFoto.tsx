// src/components/PlaceholderFoto.tsx
// Blok pengganti foto asli: latar kraft + pola titik + border putus-putus + label
// (HANDOFF §6). Dipakai selama `gambar: []` belum diisi Bu Aviella.

interface PlaceholderFotoProps {
  /** Instruksi foto yang dibutuhkan, mis. "[FOTO ASLI] Close-up rempeyek…". */
  label: string;
  className?: string;
  /** Ukuran teks label. */
  kecil?: boolean;
  /** Sembunyikan ilustrasi peyek bila kartu sudah punya sendiri. */
  tanpaIlustrasi?: boolean;
}

export default function PlaceholderFoto({
  label,
  className,
  kecil = false,
  tanpaIlustrasi = false,
}: PlaceholderFotoProps) {
  return (
    <div className={`pola-titik relative bg-kraft ${className ?? ''}`}>
      <div className="absolute inset-5 flex items-end rounded-2xl border-2 border-dashed border-kraft-titik p-5">
        <span
          className={`rounded-lg bg-krem px-3 py-1.5 font-semibold text-redup ${
            kecil ? 'text-[12px]' : 'text-[13px]'
          }`}
        >
          {label}
        </span>
      </div>
      {!tanpaIlustrasi && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-redup/70">[FOTO ASLI]</span>
        </span>
      )}
    </div>
  );
}
