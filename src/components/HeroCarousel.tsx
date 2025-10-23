import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CarouselImage {
  id: string;
  image_url: string;
  video_url: string | null;
  title: string | null;
  subtitle: string | null;
  display_order: number;
  is_active: boolean;
}

export const HeroCarousel: React.FC = () => {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCarouselImages();
  }, []);

  const loadCarouselImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_carousel_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCarouselImages(data as CarouselImage[]);
    } catch (error) {
      console.error('Error loading carousel images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (carouselImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? carouselImages.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === carouselImages.length - 1 ? 0 : currentIndex + 1);
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20" />
    );
  }

  if (carouselImages.length === 0) {
    // Fallback to default gradient background
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Carousel Images */}
      <div className="relative w-full h-full">
        {carouselImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${image.image_url})`,
                filter: 'brightness(0.7)'
              }}
            />
            
            {/* Gradient Overlay */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20" /> */}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {carouselImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {carouselImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};