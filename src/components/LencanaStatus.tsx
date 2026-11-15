// src/components/LencanaStatus.tsx
//
// Lencana status pesanan. Menerima status TAMPIL (boleh `kedaluwarsa`).

import { LABEL_STATUS, type StatusPesanan } from '@/lib/status';

const WARNA: Record<StatusPesanan | 'kedaluwarsa', string> = {
  menunggu_pembayaran: 'bg-emas text-kakao',
  kedaluwarsa: 'bg-kraft text-redup',
  dibayar: 'bg-kakao text-kertas',
  dikirim: 'bg-redup text-kertas',
  selesai: 'border border-kakao bg-kertas text-kakao',
  batal: 'border border-cabai/30 bg-cabai/10 text-cabai-tua',
};

const WARNA_ADMIN: Record<StatusPesanan | 'kedaluwarsa', string> = {
  menunggu_pembayaran: 'bg-emas/25 text-kakao',
  kedaluwarsa: 'bg-kraft text-redup',
  dibayar: 'bg-daun/15 text-daun',
  dikirim: 'bg-kakao/10 text-kakao',
  selesai: 'border border-daun/40 text-daun',
  batal: 'bg-cabai/10 text-cabai-tua',
};

export default function LencanaStatus({
  status,
  admin = false,
}: {
  status: StatusPesanan | 'kedaluwarsa';
  admin?: boolean;
}) {
  if (admin) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${WARNA_ADMIN[status]}`}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
        {LABEL_STATUS[status]}
      </span>
    );
  }
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${WARNA[status]}`}
    >
      {LABEL_STATUS[status]}
    </span>
  );
}
