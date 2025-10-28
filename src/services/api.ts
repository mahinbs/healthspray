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
    name: 'Cryo Recovery Gel',
    price: 12499,
    originalPrice: 16699,
    image: robotToyPremium,
    category: 'Recovery Products',
    description: 'Advanced cooling gel that provides instant relief for sore muscles and reduces inflammation after intense workouts.',
    features: [
      'Instant cooling sensation',
      'Reduces muscle inflammation',
      'Non-greasy formula',
      'Long-lasting relief (6+ hours)',
      'Athlete-safe ingredients',
      'Easy application and absorption'
    ],
    rating: 5,
    reviews: 127,
    isNew: true,
  },
  {
    id: '2',
    name: 'Thermo Warm-up Balm',
    price: 7499,
    image: catToyPremium,
    category: 'Warm-up Products',
    description: 'Professional-grade warming balm designed to activate muscles and improve blood circulation before workouts.',
    features: [
      'Deep muscle warming',
      'Improved blood circulation',
      'Prevents muscle strains',
      'Quick absorption',
      'Natural menthol formula',
      'Portable and convenient'
    ],
    rating: 5,
    reviews: 89,
  },
  {
    id: '3',
    name: 'Compression Recovery Sleeves',
    price: 5849,
    originalPrice: 7499,
    image: puzzleFeederPremium,
    category: 'Compression Wear',
    description: 'High-performance compression sleeves that enhance recovery and provide muscle support during and after training.',
    features: [
      'Targeted compression zones',
      'Moisture-wicking fabric',
      'Seamless construction',
      'Multiple size options',
      'Machine washable',
      'Suitable for all sports'
    ],
    rating: 4,
    reviews: 203,
  },
  {
    id: '4',
    name: 'Pain Relief Spray',
    price: 6349,
    image: laserToyPremium,
    category: 'Pain Relief',
    description: 'Instant pain relief spray with cooling menthol for immediate relief from muscle aches and joint pain.',
    features: [
      'Instant cooling relief',
      'Portable spray format',
      'No-mess application',
      'Long-lasting effect',
      'Safe for sensitive skin',
      'Quick-drying formula'
    ],
    rating: 5,
    reviews: 156,
  },
  {
    id: '5',
    name: 'Recovery Balm',
    price: 7999,
    image: puzzleFeederPremium,
    category: 'Recovery Products',
    description: 'Premium recovery balm with natural ingredients to soothe tired muscles and accelerate recovery.',
    features: [
      'Natural healing ingredients',
      'Deep muscle penetration',
      'Anti-inflammatory properties',
      'Pleasant eucalyptus scent',
      'Non-sticky formula',
      'Professional-grade quality'
    ],
    rating: 4,
    reviews: 234,
  },
  {
    id: '6',
    name: 'Muscle Relief Gel',
    price: 10849,
    originalPrice: 13349,
    image: robotToyPremium,
    category: 'Pain Relief',
    description: 'Advanced muscle relief gel that provides targeted pain relief for athletes and fitness enthusiasts.',
    features: [
      'Targeted pain relief',
      'Fast-acting formula',
      'Cooling and warming effects',
      'Professional strength',
      'Easy to apply',
      'Suitable for all muscle groups'
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