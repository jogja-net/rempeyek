import Link from 'next/link';

// Halaman 404 (HANDOFF §3, PRD §5 FR-6). Server component.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[720px] flex-col items-start justify-center gap-5 px-6 py-24">
      <span className="rounded-full bg-kraft px-3.5 py-1.5 text-[14px] font-semibold text-redup">
        404
      </span>
      <h1 className="m-0 text-[clamp(34px,4.2vw,52px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
        Halaman ini tidak ada.
      </h1>
      <p className="m-0 text-redup">
        Mungkin tautannya salah ketik atau halaman sudah dipindahkan. Kembali ke halaman utama untuk
        melihat varian rempeyek.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-12 items-center rounded-full bg-cabai px-6 text-[16px] font-bold text-white no-underline hover:bg-cabai-tua"
      >
        Ke halaman utama
      </Link>
    </main>
  );
}
