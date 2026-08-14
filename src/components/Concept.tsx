import ambianceImage from "@/assets/ambiance-interior.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Concept = () => {
  const { t } = useLanguage();
  
  return (
    <section id="concept" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 md:order-1 animate-fade-in">
            <img 
              src={ambianceImage}
              alt="Da Lu restaurant interior" 
              className="rounded-lg shadow-elegant w-full h-[500px] object-cover"
            />
          </div>
          <div className="order-1 md:order-2 animate-fade-in-up">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t("concept.title")}
            </h2>
            <div className="space-y-4 text-foreground/80 text-lg leading-relaxed">
              <p>
                {t("concept.p1")}
              </p>
              <p>
                {t("concept.p2")}
              </p>
              <p>
                {t("concept.p3")} <span className="font-semibold text-primary">{t("concept.accessible")}</span>{t("concept.p3b")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Concept;
