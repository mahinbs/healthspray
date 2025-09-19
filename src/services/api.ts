import { Product, CartItem } from '@/contexts/CartContext';

// Re-export Product type for easier imports
export type { Product };
import { supabase } from '@/integrations/supabase/client';
import { cartSyncRateLimiter } from '@/lib/rateLimiter';
import robotToyPremium from '@/assets/robot-toy-premium.jpg';
import catToyPremium from '@/assets/cat-toy-premium.jpg';
import puzzleFeederPremium from '@/assets/puzzle-feeder-premium.jpg';
import laserToyPremium from '@/assets/laser-toy-premium.jpg';

// Product API functions - Using Supabase directly
export const productAPI = {
  // Fetch all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      // For now, return mock data since we don't have a products table
      // In the future, you can fetch from Supabase products table
      return getMockProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return mock data if API fails
      return getMockProducts();
    }
  },

  // Fetch product by ID
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const products = getMockProducts();
      return products.find(product => product.id === id) || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const products = getMockProducts();
      const searchTerm = query.toLowerCase();
      return products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },
};

// Cart API functions - Using localStorage and Supabase
export const cartAPI = {
  // Sync cart with Supabase (for logged-in users)
  syncCart: async (cartItems: CartItem[]): Promise<boolean> => {
    try {
      // Check rate limiting before making the request
      if (!cartSyncRateLimiter.canMakeRequest('cart-sync')) {
        const timeUntilNext = cartSyncRateLimiter.getTimeUntilNextRequest('cart-sync');
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(timeUntilNext / 1000)} seconds.`);
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false; // No user, skip sync
      }

      // Check if cart data has actually changed to avoid unnecessary updates
      const currentCart = user.user_metadata?.cart || [];
      const cartChanged = JSON.stringify(currentCart) !== JSON.stringify(cartItems);
      
      if (!cartChanged) {
        return true; // No change, skip update
      }

      // Store cart in Supabase user_metadata or a separate cart table
      const { error } = await supabase.auth.updateUser({
        data: { cart: cartItems }
      });

      if (error) {
        console.error('Error syncing cart to Supabase:', error);
        // Re-throw the error so the calling code can handle rate limiting
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing cart:', error);
      throw error; // Re-throw to allow proper error handling
    }
  },

  // Get user's cart from Supabase
  getUserCart: async (): Promise<CartItem[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      // Get cart from user metadata
      const cart = user.user_metadata?.cart || [];
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      console.error('Error fetching user cart:', error);
      return [];
    }
  },
};

// Mock data for development/testing
const getMockProducts = (): Product[] => [
  {
    id: '1',
    name: 'SmartPlay Robot Companion',
    price: 12499,
    originalPrice: 16699,
    image: robotToyPremium,
    category: 'Interactive Robots',
    description: 'An advanced AI-powered robot companion that adapts to your pet\'s behavior and provides hours of interactive entertainment.',
    features: [
      'AI-powered adaptive play modes',
      'Motion sensors and obstacle avoidance',
      'LED light patterns for visual stimulation',
      'Rechargeable battery (8+ hours)',
      'Safe, durable materials',
      'App connectivity for remote control'
    ],
    rating: 5,
    reviews: 127,
    isNew: true,
  },
  {
    id: '2',
    name: 'FelineBot Interactive Cat Toy',
    price: 7499,
    image: catToyPremium,
    category: 'Cat Toys',
    description: 'A high-tech interactive toy designed specifically for cats, featuring feathers, motion sensors, and unpredictable movement patterns.',
    features: [
      'Automatic motion detection',
      'Replaceable feather attachments',
      'Silent motor operation',
      'Timer-based play sessions',
      'Battery level indicator',
      'Washable components'
    ],
    rating: 5,
    reviews: 89,
  },
  {
    id: '3',
    name: 'BrainBoost Puzzle Feeder',
    price: 5849,
    originalPrice: 7499,
    image: puzzleFeederPremium,
    category: 'Smart Feeders',
    description: 'Transform mealtime into a mental workout with this innovative puzzle feeder.',
    features: [
      'Adjustable difficulty levels',
      'Multiple feeding compartments',
      'Non-slip base design',
      'Easy to clean and fill',
      'Slows down eating pace',
      'Suitable for all pet sizes'
    ],
    rating: 4,
    reviews: 203,
  },
  {
    id: '4',
    name: 'AutoLaser Pro Pet Entertainment',
    price: 6349,
    image: laserToyPremium,
    category: 'Cat Toys',
    description: 'Professional-grade automatic laser toy with multiple play patterns and safety features.',
    features: [
      '5 different laser patterns',
      'Auto shut-off safety timer',
      'Silent operation mode',
      'Wall or floor mounting',
      'Remote control included',
      'Pet-safe laser technology'
    ],
    rating: 5,
    reviews: 156,
  },
  {
    id: '5',
    name: 'Smart Treat Dispenser',
    price: 7999,
    image: puzzleFeederPremium,
    category: 'Smart Feeders',
    description: 'WiFi-enabled treat dispenser with camera and two-way audio.',
    features: [
      'HD camera with night vision',
      'Two-way audio communication',
      'Scheduled treat dispensing',
      'Mobile app control',
      'Treat portion control',
      'Cloud video storage'
    ],
    rating: 4,
    reviews: 234,
  },
  {
    id: '6',
    name: 'Interactive Ball Launcher',
    price: 10849,
    originalPrice: 13349,
    image: robotToyPremium,
    category: 'Interactive Robots',
    description: 'Automatic ball launcher that keeps dogs entertained for hours.',
    features: [
      '3 distance settings (10-30ft)',
      'Motion safety sensors',
      'Weatherproof design',
      'Rechargeable battery',
      'Compatible with standard tennis balls',
      'Training mode for new pets'
    ],
    rating: 5,
    reviews: 178,
    isNew: true,
  },
];

// Utility functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

export const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}; 