import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PersonasSection from "@/components/PersonasSection";
import TechSection from "@/components/TechSection";
import ImpactSection from "@/components/ImpactSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <FeaturesSection />
    <PersonasSection />
    <TechSection />
    <ImpactSection />
    <CtaSection />
    <Footer />
  </div>
);

export default Index;
