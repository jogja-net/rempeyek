// Kepala halaman admin yang seragam: judul, satu kalimat penjelas, dan slot aksi.

export default function JudulHalaman({
  judul,
  deskripsi,
  children,
}: {
  judul: string;
  deskripsi?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <h1 className="font-judul text-3xl font-bold text-kakao">{judul}</h1>
        {deskripsi !== undefined && <p className="mt-1 text-sm text-redup">{deskripsi}</p>}
      </div>
      {children}
    </header>
  );
}
