import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-6 right-6 z-50 flex gap-2">
      <Button
        variant={language === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("en")}
        className={language === "en" 
          ? "bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-soft" 
          : "bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-background text-foreground"
        }
      >
        EN
      </Button>
      <Button
        variant={language === "de" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("de")}
        className={language === "de" 
          ? "bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-soft" 
          : "bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-background text-foreground"
        }
      >
        DE
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
