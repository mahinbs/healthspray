import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroMuscleSupplement from "@/assets/hero-muscle-supplement.jpg";
import heroPreWorkoutSupplements from "@/assets/hero-pre-workout-supplements.webp";
import heroTopSellingPreWorkout from "@/assets/hero-top-selling-pre-workout.webp";

const heroImages = [
  {
    src: heroMuscleSupplement,
    alt: "HD Muscle X Nick Walker PreHD Variant Pre-Workout Supplements",
    title: "Premium Pre-Workout Formula",
    subtitle: "HD Muscle X Nick Walker PreHD Variant for maximum performance"
  },
  {
    src: heroPreWorkoutSupplements,
    alt: "Pre-workout supplements at Supps247",
    title: "Professional Grade Supplements",
    subtitle: "High-quality pre-workout supplements for serious athletes"
  },
  {
    src: heroTopSellingPreWorkout,
    alt: "Top Selling Pre-Workout Supplement",
    title: "Top Selling Pre-Workout",
    subtitle: "Our most popular pre-workout formula for maximum performance"
  }
];

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Images */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform ${
            index === currentIndex
              ? "opacity-70 scale-100"
              : "opacity-0 scale-110"
          }`}
          style={{ backgroundImage: `url(${image.src})` }}
        />
      ))}

      {/* Dark Overlay for Better Text Contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Dots */}
          <div className="flex space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Image Info */}
      {/* <div className="absolute bottom-20 left-8 z-30 max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-2">
            {heroImages[currentIndex].title}
          </h3>
          <p className="text-white/80">
            {heroImages[currentIndex].subtitle}
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default HeroCarousel;