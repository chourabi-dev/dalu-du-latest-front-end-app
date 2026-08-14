import Hero from "@/components/Hero";
import Concept from "@/components/Concept";
import Dishes from "@/components/Dishes";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Index = () => {
  return (
    <main className="overflow-x-hidden">
      <LanguageSwitcher />
      <Hero />
      <Concept />
      <Dishes />
      <Experience />
      <Footer />
    </main>
  );
};

export default Index;
