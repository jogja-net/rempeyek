// src/components/PeyekIllustration.tsx
// SVG inline peyek, disalin dari referensi-desain.dc.html (HANDOFF §6).
// Bukan logo WhatsApp, bukan emoji — murni ilustrasi vektor.

interface PeyekIllustrationProps {
  /** Warna kacang/isi peyek. */
  warnaIsian?: string;
  /** Warna kerak/gorengan. */
  warnaKerak?: string;
  className?: string;
  /** Sembunyikan dari screen reader bila ilustrasi murni dekoratif. */
  dekoratif?: boolean;
}

export default function PeyekIllustration({
  warnaIsian = '#9A5B22',
  warnaKerak = '#E9B04C',
  className,
  dekoratif = true,
}: PeyekIllustrationProps) {
  return (
    <svg
      viewBox="0 0 220 170"
      className={className}
      aria-hidden={dekoratif ? true : undefined}
      role={dekoratif ? undefined : 'img'}
    >
      <path
        fill={warnaKerak}
        fillRule="evenodd"
        d="M24 78C12 50 38 22 72 26C92 8 134 10 150 30C182 30 204 58 192 86C206 112 180 146 148 140C128 162 86 160 70 146C38 152 8 126 22 100C10 94 14 84 24 78Z M62 62m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0Z M118 44m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z M162 92m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0Z M96 130m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z"
      />
      <g fill={warnaIsian}>
        <ellipse cx="88" cy="80" rx="13" ry="10" transform="rotate(-20 88 80)" />
        <ellipse cx="130" cy="86" rx="12" ry="9" transform="rotate(25 130 86)" />
        <ellipse cx="108" cy="110" rx="11" ry="8" />
        <ellipse cx="146" cy="60" rx="10" ry="8" transform="rotate(-10 146 60)" />
        <ellipse cx="66" cy="96" rx="9" ry="7" />
      </g>
    </svg>
  );
}

/** Ilustrasi peyek penuh detail untuk hero (2 varian sudut berbeda). */
export function PeyekHeroUtama({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 170" className={className} aria-hidden="true">
      <path
        fill="#E9B04C"
        fillRule="evenodd"
        d="M24 78C12 50 38 22 72 26C92 8 134 10 150 30C182 30 204 58 192 86C206 112 180 146 148 140C128 162 86 160 70 146C38 152 8 126 22 100C10 94 14 84 24 78Z M62 62m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0Z M118 44m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z M162 92m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0Z M96 130m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z M48 114m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0Z"
      />
      <path
        fill="none"
        stroke="#C98A2E"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
        d="M40 90c20-6 30 10 52 4M120 100c16-8 34 2 46-6M80 50c12 4 20-4 30 2"
      />
      <g fill="#9A5B22">
        <ellipse cx="88" cy="80" rx="13" ry="10" transform="rotate(-20 88 80)" />
        <ellipse cx="130" cy="86" rx="12" ry="9" transform="rotate(25 130 86)" />
        <ellipse cx="108" cy="110" rx="11" ry="8" />
        <ellipse cx="146" cy="60" rx="10" ry="8" transform="rotate(-10 146 60)" />
        <ellipse cx="66" cy="96" rx="9" ry="7" />
      </g>
      <g fill="#FFFFFF" opacity="0.35">
        <ellipse cx="84" cy="76" rx="5" ry="3" />
        <ellipse cx="126" cy="82" rx="4" ry="3" />
        <ellipse cx="104" cy="106" rx="4" ry="2.5" />
      </g>
    </svg>
  );
}

export function PeyekHeroKedua({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 170" className={className} aria-hidden="true">
      <path
        fill="#E2A53E"
        fillRule="evenodd"
        d="M24 78C12 50 38 22 72 26C92 8 134 10 150 30C182 30 204 58 192 86C206 112 180 146 148 140C128 162 86 160 70 146C38 152 8 126 22 100C10 94 14 84 24 78Z M70 58m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0Z M150 120m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0Z"
      />
      <g fill="#9A5B22">
        <ellipse cx="104" cy="74" rx="14" ry="10" transform="rotate(15 104 74)" />
        <ellipse cx="140" cy="76" rx="11" ry="8" />
        <ellipse cx="90" cy="110" rx="12" ry="9" transform="rotate(-25 90 110)" />
      </g>
    </svg>
  );
}

/** Logo kecil untuk header/footer (versi ringkas tanpa detail kacang). */
export function PeyekLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 170" className={className} aria-hidden="true">
      <path
        fill="#E9B04C"
        fillRule="evenodd"
        d="M24 78C12 50 38 22 72 26C92 8 134 10 150 30C182 30 204 58 192 86C206 112 180 146 148 140C128 162 86 160 70 146C38 152 8 126 22 100C10 94 14 84 24 78Z M62 62m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z M160 92m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0Z"
      />
      <g fill="#9A5B22">
        <ellipse cx="96" cy="80" rx="18" ry="13" transform="rotate(-20 96 80)" />
        <ellipse cx="134" cy="104" rx="15" ry="11" transform="rotate(25 134 104)" />
      </g>
    </svg>
  );
}

/** Ikon chat generik (SVG stroke) — HANDOFF §6: BUKAN logo WhatsApp. */
export function IkonChat({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12Z" />
    </svg>
  );
}

/** Ikon toples sambal untuk section sambal. */
export function IkonSambal({ className }: { className?: string }) {
  return (
    <svg width="56" height="64" viewBox="0 0 56 64" className={className} aria-hidden="true">
      <rect x="10" y="2" width="36" height="10" rx="3" fill="#F2B33D" />
      <rect x="6" y="14" width="44" height="48" rx="10" fill="#C8361D" />
      <rect x="12" y="26" width="32" height="18" rx="4" fill="#FBF5EA" opacity="0.9" />
    </svg>
  );
}
