import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, AlertTriangle, Activity, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import stiffBeforeWorkoutBg from "@/assets/stiff-before-workout-bg.jpg";
import soreAfterGameBg from "@/assets/sore-after-game-bg.webp";
import injuredDuringGameBg from "@/assets/injured-during-game-bg.jpg";

const concerns = [
  {
    id: "stiff-before-workout",
    concern: "Stiff before a workout?",
    solution: "Warm-Up Better",
    description: "Pre-workout activation and preparation",
    icon: Activity,
    gradient: "from-orange-500 to-red-600",
    bgImage: stiffBeforeWorkoutBg,
    products: ["Thermo Gel", "Warm-up Balms", "Activation Sprays"]
  },
  {
    id: "sore-after-game",
    concern: "Sore after a game?",
    solution: "Post-Workout Fix",
    description: "Recovery and muscle relief solutions",
    icon: AlertTriangle,
    gradient: "from-blue-500 to-purple-600",
    bgImage: soreAfterGameBg,
    products: ["Cryo Gel", "Recovery Balms", "Cooling Sprays"]
  },
  {
    id: "injured-during-game",
    concern: "Injured during game?",
    solution: "Instant Pain-Relief",
    description: "Immediate pain relief and injury management",
    icon: Zap,
    gradient: "from-yellow-500 to-orange-600",
    bgImage: injuredDuringGameBg,
    products: ["Cryo Spray", "Pain Relief Gel", "Instant Relief"]
  }
];

const ConcernShowcase = () => {
  const navigate = useNavigate();

  const handleConcernClick = (concernId: string) => {
    navigate(`/shop?concern=${concernId}`);
  };

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-3xl" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Shop by{" "}
            <span className="text-[#ef4e23] font-bold">
              Concern
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
            Find targeted solutions for your specific workout and recovery challenges
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-8xl mx-auto">
          {concerns.map((concern, index) => {
            const IconComponent = concern.icon;
            return (
              <GlassCard
                key={concern.id}
                intensity="medium"
                animated
                className="group overflow-hidden transition-all duration-500 hover:shadow-float cursor-pointer"
                onClick={() => handleConcernClick(concern.id)}
              >
                <div 
                  className="relative h-96 overflow-hidden bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${concern.bgImage})` }}
                >
                  {/* Dark Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-black/50" />
                  
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full blur-lg" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                  </div>

                  {/* Concern Icon */}
                  <div className="absolute top-8 left-8">
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${concern.gradient} shadow-lg`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Concern Content */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                      {concern.concern}
                    </h3>
                    <p className="text-white/90 text-base mb-6 drop-shadow-md">
                      {concern.description}
                    </p>
                    
                    {/* Solution Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {concern.products.slice(0, 2).map((product, idx) => (
                          <span
                            key={idx}
                            className="text-sm bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-white/90"
                          >
                            {product}
                          </span>
                        ))}
                        {concern.products.length > 2 && (
                          <span className="text-sm bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-white/90">
                            +{concern.products.length - 2} more
                          </span>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-white/80 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>

                    {/* Solution Button */}
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white hover:text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                      >
                        {concern.solution}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* View All Solutions Button */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate("/shop")}
            variant="outline"
            size="lg"
            className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-foreground hover:text-primary px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            View All Solutions
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ConcernShowcase;
