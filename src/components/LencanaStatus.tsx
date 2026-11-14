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

export default function LencanaStatus({ status }: { status: StatusPesanan | 'kedaluwarsa' }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${WARNA[status]}`}
    >
      {LABEL_STATUS[status]}
    </span>
  );
}
