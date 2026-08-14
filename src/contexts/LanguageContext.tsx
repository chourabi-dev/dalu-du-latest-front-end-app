import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "de";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Hero
    "hero.title": "Da Lu",
    "hero.subtitle": "A Taste of la Dolce Vita",
    "hero.tagline": "Fine Italian Food & Beverages — refined, authentic, and beautifully accessible",
    "hero.cta": "Discover Our Story",
    
    // Concept
    "concept.title": "Where Authenticity Meets Elegance",
    "concept.p1": "At Da Lu, every bite tells a story — one of tradition, passion, and the art of simplicity. Inspired by Italy's timeless kitchens, we invite you to taste la Dolce Vita in a modern, elegant way.",
    "concept.p2": "We transform Italian classics — pizza, schiacciata, pasta, and artisanal sauces — into refined dishes made with fresh, seasonal, and regional ingredients, presented with a touch of luxury.",
    "concept.p3": "This is",
    "concept.accessible": "accessible gastronomy",
    "concept.p3b": ": luxurious flavors made casual and social, where craftsmanship meets comfort.",
    
    // Dishes
    "dishes.title": "Signature Creations",
    "dishes.subtitle": "Each dish is a masterpiece — crafted with passion, served with pride",
    "dishes.pizza.name": "Artisanal Pizza",
    "dishes.pizza.desc": "Hand-stretched dough topped with seasonal ingredients, burrata, and fresh basil — a canvas of Italian flavor",
    "dishes.pasta.name": "Handmade Pasta",
    "dishes.pasta.desc": "Fresh pasta crafted daily, paired with our signature sauces that honor regional Italian traditions",
    "dishes.schiacciata.name": "Schiacciata",
    "dishes.schiacciata.desc": "Traditional flatbread with rosemary and olive oil — the rustic soul of Tuscan baking",
    
    // Experience
    "experience.title": "The Da Lu Experience",
    "experience.subtitle": "Every visit is a journey through Italian culinary tradition, reimagined for today",
    "experience.portions.title": "Individual Portions",
    "experience.portions.desc": "Taste multiple flavors in one visit — our portion sizes invite exploration and sharing",
    "experience.counter.title": "Counter Service",
    "experience.counter.desc": "Watch as your dishes are crafted with care at our elegant marble counter",
    "experience.seasonal.title": "Seasonal Menus",
    "experience.seasonal.desc": "Our menu changes with the seasons, showcasing the finest regional ingredients",
    "experience.quote": "In Italy, food is love. At Da Lu, we serve it with artistry.",
    "experience.cta": "Join Us for a Taste of Italy",
    
    // Footer
    "footer.tagline": "A taste of la Dolce Vita. Where Italian tradition meets modern elegance.",
    "footer.visit": "Visit Us",
    "footer.follow": "Follow Our Journey",
    "footer.hours": "Opening Hours:",
    "footer.hours.weekdays": "Tue-Sun: 12:00 - 22:00",
    "footer.hours.monday": "Monday: Closed",
    "footer.rights": "All rights reserved.",
  },
  de: {
    // Hero
    "hero.title": "Da Lu",
    "hero.subtitle": "Ein Hauch von la Dolce Vita",
    "hero.tagline": "Feine italienische Küche & Getränke — raffiniert, authentisch und wunderbar zugänglich",
    "hero.cta": "Entdecke unsere Geschichte",
    
    // Concept
    "concept.title": "Wo Authentizität auf Eleganz trifft",
    "concept.p1": "Bei Da Lu erzählt jeder Bissen eine Geschichte — eine von Tradition, Leidenschaft und der Kunst der Einfachheit. Inspiriert von Italiens zeitlosen Küchen laden wir Sie ein, la Dolce Vita auf moderne, elegante Weise zu erleben.",
    "concept.p2": "Wir verwandeln italienische Klassiker — Pizza, Schiacciata, Pasta und handwerkliche Saucen — in raffinierte Gerichte aus frischen, saisonalen und regionalen Zutaten, präsentiert mit einem Hauch von Luxus.",
    "concept.p3": "Das ist",
    "concept.accessible": "zugängliche Gastronomie",
    "concept.p3b": ": luxuriöse Aromen, leger und gesellig serviert, wo Handwerkskunst auf Komfort trifft.",
    
    // Dishes
    "dishes.title": "Unsere Signature-Kreationen",
    "dishes.subtitle": "Jedes Gericht ist ein Meisterwerk — mit Leidenschaft gefertigt, mit Stolz serviert",
    "dishes.pizza.name": "Handwerkliche Pizza",
    "dishes.pizza.desc": "Handgestreckter Teig belegt mit saisonalen Zutaten, Burrata und frischem Basilikum — eine Leinwand italienischer Aromen",
    "dishes.pasta.name": "Handgemachte Pasta",
    "dishes.pasta.desc": "Täglich frisch zubereitete Pasta, kombiniert mit unseren Signature-Saucen, die regionalen italienischen Traditionen huldigen",
    "dishes.schiacciata.name": "Schiacciata",
    "dishes.schiacciata.desc": "Traditionelles Fladenbrot mit Rosmarin und Olivenöl — die rustikale Seele toskanischer Backkunst",
    
    // Experience
    "experience.title": "Das Da Lu Erlebnis",
    "experience.subtitle": "Jeder Besuch ist eine Reise durch die italienische Küchentradition, neu interpretiert für heute",
    "experience.portions.title": "Individuelle Portionen",
    "experience.portions.desc": "Probieren Sie mehrere Aromen bei einem Besuch — unsere Portionsgrößen laden zum Entdecken und Teilen ein",
    "experience.counter.title": "Counter-Service",
    "experience.counter.desc": "Beobachten Sie, wie Ihre Gerichte mit Sorgfalt an unserem eleganten Marmortresen zubereitet werden",
    "experience.seasonal.title": "Saisonale Menüs",
    "experience.seasonal.desc": "Unsere Speisekarte wechselt mit den Jahreszeiten und präsentiert die besten regionalen Zutaten",
    "experience.quote": "In Italien ist Essen Liebe. Bei Da Lu servieren wir es mit Kunstfertigkeit.",
    "experience.cta": "Besuchen Sie uns für einen Hauch von Italien",
    
    // Footer
    "footer.tagline": "Ein Hauch von la Dolce Vita. Wo italienische Tradition auf moderne Eleganz trifft.",
    "footer.visit": "Besuchen Sie uns",
    "footer.follow": "Folgen Sie unserer Reise",
    "footer.hours": "Öffnungszeiten:",
    "footer.hours.weekdays": "Di-So: 12:00 - 22:00 Uhr",
    "footer.hours.monday": "Montag: Geschlossen",
    "footer.rights": "Alle Rechte vorbehalten.",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("dalu-language");
    return (saved === "de" || saved === "en" ? saved : "en") as Language;
  });

  useEffect(() => {
    localStorage.setItem("dalu-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
