import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, ShoppingBag } from "lucide-react";
import heroImage from "@/assets/hero-dalu.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();
  
  const scrollToMenu = () => {
    document.getElementById('concept')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6">
            {t("hero.title")}
          </h1>
          <p className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary-foreground/90 mb-4 italic">
            {t("hero.subtitle")}
          </p>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto font-light">
            {t("hero.tagline")}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 shadow-elegant">
              <Link to="/order">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Order Online
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToMenu}
              className="border-primary-foreground/40 bg-transparent text-lg px-8 py-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              {t("hero.cta")}
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button 
        onClick={scrollToMenu}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/70 hover:text-primary-foreground transition-colors animate-float"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
};

export default Hero;
