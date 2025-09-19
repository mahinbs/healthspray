import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, Dumbbell, Shirt, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import warmupBg from "@/assets/warmup-cooldown-bg.jpg";
import compressionBg from "@/assets/compression-wear-bg.jpg";
import painReliefBg from "@/assets/pain-relief-bg.webp";

const categories = [
  {
    id: "warmup-cooldown",
    name: "Warm-up & Cooldown",
    description: "Pre and post workout solutions",
    icon: Dumbbell,
    gradient: "from-orange-500 to-red-600",
    bgImage: warmupBg,
    products: ["Thermo Gel", "Cryo Gel", "Recovery Tools"]
  },
  {
    id: "compression-wear",
    name: "Compression Wear",
    description: "Performance enhancing apparel",
    icon: Shirt,
    gradient: "from-blue-500 to-purple-600",
    bgImage: compressionBg,
    products: ["Compression Sleeves", "Recovery Shirts", "Support Gear"]
  },
  {
    id: "pain-relief",
    name: "Pain Relief",
    description: "Instant relief solutions",
    icon: Zap,
    gradient: "from-yellow-500 to-orange-600",
    bgImage: painReliefBg,
    products: ["Cryo Spray", "Pain Relief Gel", "Recovery Balms"]
  }
];

const CategoryShowcase = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/shop?category=${categoryId}`);
  };

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      <div className="absolute inset-0 bg-muted/30 backdrop-blur-3xl" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Shop by{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
            Discover our specialized product categories designed for every aspect of your fitness journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-8xl mx-auto">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <GlassCard
                key={category.id}
                intensity="medium"
                animated
                className="group overflow-hidden transition-all duration-500 hover:shadow-float cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div 
                  className="relative h-96 overflow-hidden bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${category.bgImage})` }}
                >
                  {/* Dark Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full blur-lg" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                  </div>

                  {/* Category Icon */}
                  <div className="absolute top-10 left-10">
                    <div className={`p-5 rounded-2xl bg-gradient-to-r ${category.gradient} shadow-xl`}>
                      <IconComponent className="h-10 w-10 text-white" />
                    </div>
                  </div>

                  {/* Category Title */}
                  <div className="absolute bottom-10 left-10 right-10">
                    <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                      {category.name}
                    </h3>
                    <p className="text-white/90 text-lg mb-8 drop-shadow-md">
                      {category.description}
                    </p>
                    
                    {/* Arrow Icon */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {category.products.slice(0, 2).map((product, idx) => (
                          <span
                            key={idx}
                            className="text-base bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90"
                          >
                            {product}
                          </span>
                        ))}
                        {category.products.length > 2 && (
                          <span className="text-base bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90">
                            +{category.products.length - 2} more
                          </span>
                        )}
                      </div>
                      <ArrowRight className="h-6 w-6 text-white/80 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate("/shop")}
            variant="outline"
            size="lg"
            className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-foreground hover:text-primary px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            View All Categories
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
