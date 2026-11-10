'use client';

import { track } from '@vercel/analytics';
import type { ReactNode } from 'react';

type Lokasi = 'hero' | 'header' | 'kartu' | 'sambal' | 'hampers' | 'faq' | 'cta' | 'sticky';

interface WaLinkProps {
  /** URL wa.me yang sudah di-encode. */
  href: string;
  /** Dipakai untuk event analytics `wa_click`. */
  lokasi: Lokasi;
  /** Slug produk bila klik berasal dari kartu produk / sambal. */
  produk?: string;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
}

/**
 * Satu-satunya komponen client di halaman ini.
 * Tugasnya hanya mengirim event `wa_click` saat diklik; isi halaman tetap server-rendered.
 */
export default function WaLink({
  href,
  lokasi,
  produk,
  className,
  children,
  'aria-label': ariaLabel,
}: WaLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        track('wa_click', produk ? { lokasi, produk } : { lokasi });
      }}
    >
      {children}
    </a>
  );
}
