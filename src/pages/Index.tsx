import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PersonasSection from "@/components/PersonasSection";
import TechSection from "@/components/TechSection";
import AboutSection from "@/components/AboutSection";
import ImpactSection from "@/components/ImpactSection";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <FeaturesSection />
    <PersonasSection />
    <TechSection />
    <AboutSection />
    <ImpactSection />
    <FaqSection />
    <CtaSection />
    <Footer />
  </div>
);

export default Index;
