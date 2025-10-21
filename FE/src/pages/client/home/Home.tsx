import { HeroSection } from "./components/HeroSection";
import { ServicesSection } from "./components/ServicesSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { GallerySection } from "./components/GallerySection";
import { CTASection } from "./components/CTASection";

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <GallerySection />
      <CTASection />
    </div>
  );
};
