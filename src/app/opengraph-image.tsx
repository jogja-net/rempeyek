import { ImageResponse } from 'next/og';
import { site } from '@/data/site';

// OG image 1200x630 (HANDOFF §3 & §8). Penting karena preview link di WhatsApp
// adalah kesan pertama calon pembeli.
export const alt = `${site.nama} — Rempeyek kacang kriuk, pesan via WhatsApp`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FBF5EA',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              backgroundColor: '#F2B33D',
              display: 'flex',
            }}
          />
          <span style={{ fontSize: 34, fontWeight: 700, color: '#2B1A0E' }}>{site.nama}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <span
            style={{
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
              color: '#2B1A0E',
              letterSpacing: '-0.03em',
            }}
          >
            Rempeyek kacang yang kriuknya bikin nambah nasi.
          </span>
          <span style={{ fontSize: 34, color: '#5A4130' }}>
            Digoreng di dapur rumah · Pesan langsung via WhatsApp
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #E3D3B4',
            paddingTop: 28,
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 700, color: '#C8361D' }}>
            Eceran & hampers
          </span>
          <span style={{ fontSize: 28, color: '#5A4130' }}>
            {site.kota ?? '[KOTA]'}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
