import pizzaImage from "@/assets/dish-pizza.jpg";
import pastaImage from "@/assets/dish-pasta.jpg";
import schiacciatImage from "@/assets/dish-schiacciata.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Dishes = () => {
  const { t } = useLanguage();
  
  const dishes = [
    {
      nameKey: "dishes.pizza.name",
      descKey: "dishes.pizza.desc",
      image: pizzaImage,
    },
    {
      nameKey: "dishes.pasta.name",
      descKey: "dishes.pasta.desc",
      image: pastaImage,
    },
    {
      nameKey: "dishes.schiacciata.name",
      descKey: "dishes.schiacciata.desc",
      image: schiacciatImage,
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-warm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("dishes.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("dishes.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {dishes.map((dish, index) => (
            <div 
              key={dish.nameKey}
              className="group animate-scale-in bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-500"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={dish.image}
                  alt={t(dish.nameKey)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                  {t(dish.nameKey)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(dish.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dishes;
