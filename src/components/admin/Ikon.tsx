// Ikon garis kecil untuk panel admin (SVG inline, gaya Lucide). Dekoratif: aria-hidden.

const JALUR = {
  beranda: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  pesanan: (
    <>
      <path d="M9 3h6l1 2h3v16H5V5h3z" />
      <path d="M9 11h6M9 15h6" />
    </>
  ),
  produk: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </>
  ),
  laporan: <path d="M3 21h18M6 21V11M12 21V4M18 21v-7" />,
  toko: <path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6" />,
  keluar: <path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9" />,
  waktu: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  kirim: (
    <>
      <path d="M2 6h11v10H2zM13 9h5l3 3v4h-8" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  kanan: <path d="m9 6 6 6-6 6" />,
} as const;

export type NamaIkon = keyof typeof JALUR;

export default function Ikon({ nama, className = 'h-[18px] w-[18px]' }: { nama: NamaIkon; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {JALUR[nama]}
    </svg>
  );
}
