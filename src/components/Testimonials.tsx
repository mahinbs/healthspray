import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { GlassCard } from "@/components/ui/glass-card";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import testimonialImage from "@/assets/testimonial-priya.jpg";

const testimonials = [
  {
    name: "Rahul S.",
    role: "29 | Fitness Enthusiast",
    quote: "No more next-day soreness.",
    content: "I train six days a week, and recovery used to be my biggest struggle. Ever since I started using Physiq’s Magnesium Recovery Cream, my legs don’t feel heavy the next morning — I’m actually excited for my workouts again.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Priya M.",
    role: "33 | Marathon Runner",
    quote: "It’s like instant relief after long runs.",
    content: "I’m a marathon runner, and this cream has become my post-run ritual. The cooling effect hits instantly, and the muscle tension just melts away. It’s lightweight, non-sticky, and smells refreshing.",
    rating: 4.5,
    image: testimonialImage,
  },
  {
    name: "Divya K.",
    role: "35 | Gym Member & Yoga Practitioner",
    quote: "Helps me stay consistent.",
    content: "As a working mom who trains in the evenings, soreness used to slow me down. Physiq’s recovery cream gives me that quick recovery I need to stay on track without skipping sessions.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Arjun P.",
    role: "31 | Strength Trainer",
    quote: "My go-to after strength sessions.",
    content: "I do heavy lifts four times a week, and this cream helps my muscles bounce back faster. It absorbs quickly and genuinely reduces post-workout pain — it’s part of my gym bag now.",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80",
  },
];

const Testimonials = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 2000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="h-8 w-8 fill-[#ef4e23] text-[#ef4e23] mx-1"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative mx-1">
          <Star className="h-8 w-8 text-[#ef4e23]" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-8 w-8 fill-[#ef4e23] text-[#ef4e23]" />
          </div>
        </div>
      );
    }

    return stars;
  };

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-20 animate-fade-in">
          <GlassCard intensity="light" className="inline-block px-6 py-3 mb-8">
            <span className="text-sm font-medium text-primary">💝 Customer Love</span>
          </GlassCard>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            What our{" "}
            <span className="text-[#ef4e23] font-bold">
              Customers Say
            </span>
          </h2>
          <p className="text-2xl text-muted-foreground">Real stories from athletes and fitness enthusiasts</p>
        </div>
        
        <div className="max-w-5xl mx-auto relative group">
          {/* Navigation Buttons */}
          <button 
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 p-3 rounded-full bg-white/80 backdrop-blur-md shadow-lg hover:bg-white transition-all duration-300 group-hover:opacity-100 opacity-0 md:opacity-100"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-8 w-8 text-primary hover:scale-110 transition-transform" />
          </button>
          
          <button 
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 p-3 rounded-full bg-white/80 backdrop-blur-md shadow-lg hover:bg-white transition-all duration-300 group-hover:opacity-100 opacity-0 md:opacity-100"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-8 w-8 text-primary hover:scale-110 transition-transform" />
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 pl-4">
                  <GlassCard intensity="medium" className="relative p-12 overflow-hidden min-h-[500px] flex flex-col justify-center mx-4">
                    {/* Decorative Quote */}
                    <Quote className="absolute top-8 left-8 h-16 w-16 text-primary/20" />
                    
                    <div className="relative z-10">
                      {/* Rating Stars */}
                      <div className="flex justify-center items-center mb-8">
                        {renderStars(testimonial.rating)}
                      </div>
                      
                      {/* Testimonial Text */}
                      <div className="text-center mb-12">
                        <h3 className="text-2xl font-bold text-[#ef4e23] mb-4">
                          "{testimonial.quote}"
                        </h3>
                        <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed font-medium">
                          "{testimonial.content}"
                        </blockquote>
                      </div>
                      
                      {/* Customer Info */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-6">
                          <div className="relative">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-glow"
                            />
                            <div className="absolute -inset-2 bg-gradient-primary rounded-full opacity-20 blur-lg animate-pulse-slow" />
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{testimonial.name}</div>
                            <div className="text-lg text-primary font-medium">{testimonial.role}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Background Decoration */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-primary rounded-full opacity-10 blur-3xl animate-float" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-accent rounded-full opacity-10 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
                  </GlassCard>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === selectedIndex 
                    ? "bg-[#ef4e23] w-8" 
                    : "bg-gray-300 hover:bg-[#ef4e23]/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;