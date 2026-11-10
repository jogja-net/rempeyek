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

// Landing page (server component). Urutan section mengikuti HANDOFF §7.
// Tanpa "use client" di level page: seluruh konten produk ada di HTML hasil build.
export default function Home() {
  return (
    <>
      <JsonLd />
      <Header />

      <main>
        <Hero />
        <ProductGrid />
        <SambalSection />
        <Hampers />
        <WhyUs />
        <HowToOrder />
        <Testimonials />
        <Faq />
        <CtaBand />
      </main>

      <Footer />
      <StickyWaBar />
    </>
  );
}
