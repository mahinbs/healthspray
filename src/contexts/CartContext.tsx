import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';
import { cartSyncRateLimiter } from '../lib/rateLimiter';

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  mainImage?: string;
  secondaryImage?: string;
  category: string;
  description?: string;
  features?: string[];
  rating: number;
  reviews: number;
  isNew?: boolean;
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isSyncing: boolean;
  couponApplied: {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    max_discount: number | null;
    discountAmount: number;
  } | null;
  finalTotal: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'APPLY_COUPON'; payload: { id: string; code: string; type: 'percentage' | 'fixed'; value: number; max_discount: number | null; discountAmount: number } }
  | { type: 'REMOVE_COUPON' };

// Initial state
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isSyncing: false,
  couponApplied: null,
  finalTotal: 0,
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          finalTotal: state.couponApplied 
            ? Math.max(1, updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) - state.couponApplied.discountAmount)
            : updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        };
      } else {
        const newItem: CartItem = { product: action.payload, quantity: 1 };
        const updatedItems = [...state.items, newItem];
        
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          finalTotal: state.couponApplied 
            ? Math.max(1, updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) - state.couponApplied.discountAmount)
            : updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.product.id !== action.payload);
      
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.product.id === action.payload.productId
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        couponApplied: null,
        finalTotal: 0,
      };
    
    case 'LOAD_CART': {
      const items = action.payload;
      return {
        ...state,
        items,
        total: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      };
    }
    
    case 'SET_SYNCING': {
      return {
        ...state,
        isSyncing: action.payload,
      };
    }
    
    case 'APPLY_COUPON': {
      const finalTotal = Math.max(1, state.total - action.payload.discountAmount);
      return {
        ...state,
        couponApplied: action.payload,
        finalTotal,
      };
    }
    
    case 'REMOVE_COUPON': {
      return {
        ...state,
        couponApplied: null,
        finalTotal: state.total,
      };
    }
    
    default:
      return state;
  }
};

// Context
interface CartContextType {
  state: CartState;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  syncCart: () => Promise<void>;
  forceSyncCart: () => Promise<void>;
  applyCoupon: (coupon: { id: string; code: string; type: 'percentage' | 'fixed'; value: number; max_discount: number | null; discountAmount: number }) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);
  const lastCartDataRef = useRef<string>('');
  const SYNC_COOLDOWN = 2000; // 2 seconds cooldown between syncs

  // Load cart from localStorage and backend on mount
  useEffect(() => {
    const loadCart = async () => {
      // Load from localStorage first
      const savedCart = localStorage.getItem('zippty-cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }

      // Load from backend for authenticated users
      if (user) {
        try {
          const backendCart = await cartAPI.getUserCart();
          if (backendCart.length > 0) {
            dispatch({ type: 'LOAD_CART', payload: backendCart });
          }
        } catch (error) {
          console.error('Error loading cart from backend:', error);
        }
      }
    };

    loadCart();
  }, [user]);

  // Save cart to localStorage and sync with backend whenever it changes
  useEffect(() => {
    localStorage.setItem('zippty-cart', JSON.stringify(state.items));
    
    // Check if cart data has actually changed
    const currentCartData = JSON.stringify(state.items);
    if (currentCartData === lastCartDataRef.current) {
      return; // No change, skip sync
    }
    lastCartDataRef.current = currentCartData;
    
    // Sync with backend for authenticated users with debouncing and rate limiting
    if (user) {
      const now = Date.now();
      if (now - lastSyncRef.current > SYNC_COOLDOWN) {
        // Clear any pending sync
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        
        // Debounce the sync to avoid rapid successive calls
        syncTimeoutRef.current = setTimeout(() => {
          syncCartWithBackend();
        }, 500); // 500ms debounce
      }
    }
  }, [state.items, user]);

  const syncCartWithBackend = async () => {
    if (!user) return;
    
    const now = Date.now();
    if (now - lastSyncRef.current < SYNC_COOLDOWN) {
      console.log('Skipping sync due to rate limiting');
      return;
    }
    
    dispatch({ type: 'SET_SYNCING', payload: true });
    try {
      await cartAPI.syncCart(state.items);
      lastSyncRef.current = now;
    } catch (error: any) {
      console.error('Error syncing cart with backend:', error);
      
      // Handle rate limiting more aggressively
      if (error?.message?.includes('rate limit') || 
          error?.message?.includes('429') || 
          error?.status === 429 ||
          error?.code === 'RATE_LIMIT_EXCEEDED') {
        console.warn('Rate limit hit, extending cooldown period');
        lastSyncRef.current = now + 10000; // 10 seconds cooldown
        
        // Store cart locally as backup
        localStorage.setItem('zippty-cart-backup', JSON.stringify({
          items: state.items,
          timestamp: now
        }));
      } else if (error?.message?.includes('Too Many Requests')) {
        console.warn('Too many requests, extending cooldown period');
        lastSyncRef.current = now + 15000; // 15 seconds cooldown
        
        // Store cart locally as backup
        localStorage.setItem('zippty-cart-backup', JSON.stringify({
          items: state.items,
          timestamp: now
        }));
      }
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Cart actions
  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId: string) => {
    return state.items.some(item => item.product.id === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = state.items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const applyCoupon = (coupon: { id: string; code: string; type: 'percentage' | 'fixed'; value: number; max_discount: number | null; discountAmount: number }) => {
    dispatch({ type: 'APPLY_COUPON', payload: coupon });
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  const syncCart = async () => {
    if (user) {
      // Force sync by resetting the cooldown
      lastSyncRef.current = 0;
      await syncCartWithBackend();
    }
  };

  // Manual sync function that bypasses rate limiting (for user-initiated actions)
  const forceSyncCart = async () => {
    if (user) {
      lastSyncRef.current = 0;
      await syncCartWithBackend();
    }
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    syncCart,
    forceSyncCart,
    applyCoupon,
    removeCoupon,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { CartProvider, useCart }; 