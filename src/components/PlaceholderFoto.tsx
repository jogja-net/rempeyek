// src/components/PlaceholderFoto.tsx
// Blok pengganti foto asli: latar kraft + pola titik + border putus-putus
// (HANDOFF §6). Dipakai selama `gambar: []` belum diisi Bu Aviella. Tanpa teks.

interface PlaceholderFotoProps {
  className?: string;
}

export default function PlaceholderFoto({ className }: PlaceholderFotoProps) {
  return (
    <div className={`pola-titik relative bg-kraft ${className ?? ''}`} aria-hidden="true">
      <div className="absolute inset-5 rounded-2xl border-2 border-dashed border-kraft-titik" />
    </div>
  );
}
