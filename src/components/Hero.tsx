import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, Play, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FloatingElements from "./FloatingElements";
import HeroCarousel from "./HeroCarousel";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-mesh" />

      {/* Dynamic Hero Carousel */}
      <HeroCarousel />

      {/* Floating Elements */}
      <FloatingElements />

      {/* Enhanced Glass Overlay */}

      <div className="relative z-20 container mx-auto px-4 text-center text-white">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Animated Main Heading */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight drop-shadow-2xl">
              <span className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                Joy for them{" "}
              </span>
              <span className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                love from you
              </span>{" "}
              <span className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                only at{" "}
              </span>
              <span className="relative text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                Zippty
                <div className="absolute -inset-2 bg-gradient-primary opacity-30 blur-xl rounded-full animate-pulse-slow" />
              </span>
            </h1>

            <div className="bg-black/30 backdrop-blur-md rounded-3xl p-8 border border-white/30 max-w-4xl mx-auto shadow-2xl">
              <p className="text-2xl md:text-3xl text-white leading-relaxed animate-slide-up drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-medium">
                At Zippty, we know pets are more than just animals they're family. That's why we create innovative interactive toys that keep them happy, engaged, and cared for every moment.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-8 justify-center items-center animate-scale-in pb-20">
            <Button
              onClick={() => navigate("/shop")}
              variant="hero"
              size="lg"
              className="group text-lg px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              Shop Now
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
            <div className="text-lg text-white/90 animate-bounce-slow drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
              <p className="">
                ✨ Transform playtime into an extraordinary adventure ✨
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-slide-up">
            <GlassCard
              intensity="medium"
              animated
              className="p-6 text-center bg-black/30 backdrop-blur-md border border-white/30 shadow-2xl"
            >
              <Heart className="h-8 w-8 text-red-400 mx-auto mb-3 animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <div className="text-3xl font-bold mb-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                2k+
              </div>
              <div className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Happy Pets
              </div>
            </GlassCard>

            <GlassCard
              intensity="medium"
              animated
              className="p-6 text-center bg-black/30 backdrop-blur-md border border-white/30 shadow-2xl"
            >
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-3 animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <div className="text-3xl font-bold mb-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                4.9
              </div>
              <div className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Average Rating
              </div>
            </GlassCard>

            <GlassCard
              intensity="medium"
              animated
              className="p-6 text-center bg-black/30 backdrop-blur-md border border-white/30 shadow-2xl"
            >
              <div className="text-2xl mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                🎮
              </div>
              <div className="text-3xl font-bold mb-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                50+
              </div>
              <div className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Smart Toys
              </div>
            </GlassCard>
          </div> */}
        </div>
      </div>
    </section>
  );
};
export default Hero;
