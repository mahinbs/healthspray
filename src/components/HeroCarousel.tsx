import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPet1 from "@/assets/hero-pet-1.jpg";
import heroPet2 from "@/assets/hero-pet-2.jpg";
import heroPet3 from "@/assets/hero-pet-3.jpg";

const heroImages = [
  {
    src: heroPet1,
    alt: "Golden retriever playing with interactive smart toy",
    title: "Smart Play for Smart Pets",
    subtitle: "Interactive toys that adapt to your pet's behavior"
  },
  {
    src: heroPet2,
    alt: "Orange tabby cat with puzzle feeder",
    title: "Mental Stimulation Made Fun",
    subtitle: "Puzzle feeders that challenge and entertain"
  },
  {
    src: heroPet3,
    alt: "Beagle puppy with automated ball launcher",
    title: "Endless Entertainment",
    subtitle: "Automated toys for active playtime"
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
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full"
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