import { Wine, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Experience = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Sparkles,
      titleKey: "experience.portions.title",
      descKey: "experience.portions.desc",
    },
    {
      icon: Users,
      titleKey: "experience.counter.title",
      descKey: "experience.counter.desc",
    },
    {
      icon: Wine,
      titleKey: "experience.seasonal.title",
      descKey: "experience.seasonal.desc",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("experience.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("experience.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.titleKey}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center animate-scale-in">
          <p className="font-serif text-2xl text-foreground mb-8 italic">
            "{t("experience.quote")}"
          </p>
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg px-8 py-6 shadow-elegant"
          >
            {t("experience.cta")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Experience;
