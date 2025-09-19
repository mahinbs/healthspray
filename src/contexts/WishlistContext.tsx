import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description?: string;
  features?: string[];
  rating: number;
  reviews: number;
  isNew?: boolean;
}

interface WishlistState {
  items: Product[];
  count: number;
}

type WishlistAction = 
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: Product[] };

const initialState: WishlistState = {
  items: [],
  count: 0,
};

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_ITEM':
      if (state.items.find(item => item.id === action.payload.id)) {
        return state; // Item already in wishlist
      }
      const newItems = [...state.items, action.payload];
      return {
        items: newItems,
        count: newItems.length,
      };
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        items: filteredItems,
        count: filteredItems.length,
      };
    
    case 'CLEAR_WISHLIST':
      return {
        items: [],
        count: 0,
      };
    
    case 'LOAD_WISHLIST':
      return {
        items: action.payload,
        count: action.payload.length,
      };
    
    default:
      return state;
  }
};

interface WishlistContextType {
  state: WishlistState;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('zippty-wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        dispatch({ type: 'LOAD_WISHLIST', payload: parsedWishlist });
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('zippty-wishlist', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    toast.success(`${product.name} added to wishlist! ❤️`);
  };

  const removeItem = (productId: string) => {
    const item = state.items.find(item => item.id === productId);
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    if (item) {
      toast.success(`${item.name} removed from wishlist`);
    }
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    toast.success('Wishlist cleared');
  };

  const isInWishlist = (productId: string): boolean => {
    return state.items.some(item => item.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <WishlistContext.Provider value={{
      state,
      addItem,
      removeItem,
      clearWishlist,
      isInWishlist,
      toggleWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};