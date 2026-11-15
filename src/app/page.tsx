import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import SambalSection from '@/components/SambalSection';
import Hampers from '@/components/Hampers';
import WhyUs from '@/components/WhyUs';
import HowToOrder from '@/components/HowToOrder';
import Testimonials from '@/components/Testimonials';
import Faq from '@/components/Faq';
import CtaBand from '@/components/CtaBand';
import Footer from '@/components/Footer';
import StickyWaBar from '@/components/StickyWaBar';
import JsonLd from '@/components/JsonLd';
import PitaDemo from '@/components/PitaDemo';
import { ambilKatalogLanding } from '@/lib/katalog';
import { marketplaceAktif } from '@/lib/mode';

// Landing page (server component). Urutan section mengikuti HANDOFF §7.
// Tanpa "use client" di level page: seluruh konten produk ada di HTML hasil build.
//
// Katalog dibaca SEKALI di sini (database bila marketplace aktif, data statis bila tidak)
// lalu dioper ke komponen yang butuh. Halaman tetap statis; perubahan dari panel admin
// memanggil revalidatePath('/') sehingga build ulang terjadi otomatis.
export default async function Home() {
  const katalog = await ambilKatalogLanding();

  return (
    <>
      {/* Pita demo hanya di versi marketplace; produksi tidak berubah. */}
      {marketplaceAktif() && <PitaDemo />}
      <JsonLd katalog={katalog} />
      <Header />

      <main>
        <Hero katalog={katalog} />
        <ProductGrid katalog={katalog} />
        <SambalSection katalog={katalog} />
        <Hampers />
        <WhyUs />
        <HowToOrder />
        <Testimonials />
        <Faq />
        <CtaBand />
      </main>

      <Footer />
      <StickyWaBar katalog={katalog} />
    </>
  );
}
