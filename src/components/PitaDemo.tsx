// src/components/PitaDemo.tsx
//
// Pita penanda bahwa halaman ini bagian dari demo marketplace (Global
// Constraints: tampil di SEMUA halaman marketplace). Dipakai admin (Task 7)
// dan halaman pembeli (Task 9). Tidak ikut tercetak.

export default function PitaDemo() {
  return (
    <div
      role="note"
      className="bg-emas px-4 py-2 text-center text-xs font-semibold text-kakao print:hidden"
    >
      MODE DEMO: data dan ongkir tiruan
    </div>
  );
}
