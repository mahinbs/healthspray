import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import FloatingElements from "./FloatingElements";
import { HeroCarousel } from "./HeroCarousel";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const navigate = useNavigate();
  const [heroContent, setHeroContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadHeroContent();
        setHeroContent(data);
      } catch (error) {
        console.error('Error loading hero content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const loadHeroContent = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_section')
        .select('*')
        .eq('section_type', 'main_hero')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error loading hero content:', error);
      return null;
    }
  };


  return (
    <section className="relative min-h-screen flex items-end pb-16 justify-center overflow-hidden">
    {/* <section className="relative min-h-screen flex items-center justify-center overflow-hidden"> */}
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
          {/* <div className="space-y-6 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight drop-shadow-2xl">
              {heroContent?.title ? (
                <span className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                  {heroContent.title}
                </span>
              ) : (
                <>
                  <span className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                    Relieve Pain.{" "}
                  </span>
                  <span className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                    Recover Faster.
                  </span>{" "}
                  <span className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                    Rise{" "}
                  </span>
                  <span className="relative text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                    Stronger.
                    <div className="absolute -inset-2 bg-gradient-primary opacity-30 blur-xl rounded-full animate-pulse-slow" />
                  </span>
                </>
              )}
            </h1>

            <div className="bg-orange-500/20 backdrop-blur-md rounded-3xl p-8 border border-orange-200/30 max-w-4xl mx-auto shadow-2xl">
              <p className="text-2xl md:text-3xl text-white leading-relaxed animate-slide-up drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-medium">
                {heroContent?.subtitle || "Scientifically designed pain relief and recovery solutions to keep you moving — before, during, and after every workout."}
              </p>
            </div>
          </div> */}

          {/* Action Buttons */}
          <div className="flex flex-col gap-8 justify-center items-center animate-scale-in pb-20">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                onClick={() => navigate(heroContent?.cta_primary_url || "/shop")}
                variant="hero"
                size="lg"
                className="group text-lg px-10 py-7 rounded-2xl hover:scale-105 transition-all duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                {heroContent?.cta_primary_text || "Shop Now"}
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            {/* <Button
              onClick={() => navigate(heroContent?.cta_secondary_url || "/regimens")}
              variant="outline"
              size="lg"
              className="group text-lg px-8 py-4 rounded-2xl bg-orange-500/20 hover:bg-orange-500/30 backdrop-blur-md border border-orange-200/30 text-white hover:scale-105 transition-all duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
                {heroContent?.cta_secondary_text || "Explore Regimens"}
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button> */}
            </div>
            {/*             <div className="text-lg text-white/90 animate-bounce-slow drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
              <p className="">
                ✨ {heroContent?.description || "Professional-grade sports health solutions for peak performance"} ✨
              </p>
            </div> */}
          </div>


          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-slide-up">
            <GlassCard
              intensity="medium"
              animated
              className="p-6 text-center bg-black/30 backdrop-blur-md border border-white/30 shadow-2xl"
            >
              <Heart className="h-8 w-8 text-[#ef4e23] mx-auto mb-3 animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              <div className="text-3xl font-bold mb-2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                2k+
              </div>
              <div className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Active Athletes
              </div>
            </GlassCard>

            <GlassCard
              intensity="medium"
              animated
              className="p-6 text-center bg-black/30 backdrop-blur-md border border-white/30 shadow-2xl"
            >
              <Star className="h-8 w-8 text-[#ef4e23] mx-auto mb-3 animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
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
                Recovery Products
              </div>
            </GlassCard>
          </div> */}
        </div>
      </div>
    </section>
  );
};
export default Hero;
