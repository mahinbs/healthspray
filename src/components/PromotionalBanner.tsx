import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PromotionalBannerData {
  id: string;
  text: string;
  text_color: string;
  background_color: string;
  is_active: boolean;
  animation_speed: number;
}

const PromotionalBanner = () => {
  const [bannerData, setBannerData] = useState<PromotionalBannerData | null>(null);

  useEffect(() => {
    loadBannerData();
  }, []);

  const loadBannerData = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_banner')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading promotional banner:', error);
        return;
      }

      if (data) {
        setBannerData(data);
      }
    } catch (error) {
      console.error('Error loading promotional banner:', error);
    }
  };

  // Don't render if no banner data
  if (!bannerData) {
    return null;
  }

  return (
    <div 
      className="relative overflow-hidden py-2 px-4 text-center font-medium text-sm"
      style={{
        backgroundColor: bannerData.background_color,
        color: bannerData.text_color,
      }}
    >
      {/* Simple scrolling text */}
      <div 
        className="whitespace-nowrap animate-marquee"
        style={{
          animationDuration: `${bannerData.animation_speed}s`,
        }}
      >
        {bannerData.text}
      </div>
    </div>
  );
};

export default PromotionalBanner;
