import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useCart, Product } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice } from "@/services/api";

interface ProductCardProps {
  product: Product;
  onViewDetails?: () => void;
}

const ProductCard = ({ product, onViewDetails }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem, isInCart, getItemQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    setIsAddingToCart(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    addItem(product);
    setIsAddingToCart(false);
  };

  const cartQuantity = getItemQuantity(product.id);
  const isInCartState = isInCart(product.id);
  const isLiked = isInWishlist(product.id);
  const isOutOfStock = (product.stock ?? 0) <= 0;

  return (
    <GlassCard 
      intensity="medium" 
      animated
      className="group overflow-hidden transition-all duration-500 hover:shadow-float h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-0 flex flex-col h-full">
        <div className="relative overflow-hidden rounded-t-2xl">
          <img 
            src={product.image} 
            alt={product.name}
            className={`w-full object-cover aspect-square h-full transition-all duration-700 ${
              isHovered ? 'scale-110 brightness-110' : 'scale-100'
            }`}
          />
          
          {/* Floating Badges */}
          <div className="absolute z-10 top-4 left-4 flex flex-col gap-2">
            {isOutOfStock && (
              <Badge className="bg-gray-500 text-white shadow-glow">
                Out of Stock
              </Badge>
            )}
             {!isOutOfStock && (product.isNew || false) && (
               <Badge className="bg-[#ef4e23] text-white shadow-glow">
                 ✨ New
               </Badge>
             )}
            {!isOutOfStock && product.originalPrice && (
              <Badge variant="destructive" className="shadow-glow">
                Sale
              </Badge>
            )}
            {!isOutOfStock && isInCartState && (
              <Badge className="bg-green-500 text-white shadow-glow">
                <CheckCircle className="h-3 w-3 mr-1" />
                In Cart ({cartQuantity})
              </Badge>
            )}
          </div>
          
          {/* Heart Button */}
          <button
            onClick={() => toggleWishlist(product)}
            className={`absolute z-10 top-4 right-4 p-3 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 ${
              isLiked ? 'bg-[#ef4e23]/20 text-[#ef4e23]' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          {/* Overlay on Hover */}
          <div className={`absolute inset-0 bg-gradient-primary/20 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>
        
        <div className="p-4 flex flex-col">
          <div className="space-y-2 flex-grow">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">{product.category}</p>
            <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors duration-300 min-h-[2.5rem] flex items-center">
              {product.name}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2 my-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 transition-colors duration-300 ${
                    i < (product.rating || 0) ? 'fill-[#ef4e23] text-[#ef4e23]' : 'text-gray-400'
                  }`} 
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-medium">({product.reviews || 0} reviews)</span>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-[#ef4e23]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-auto pb-1">
            <Button 
              variant="outline" 
              className="flex-1 border-white/20 text-foreground hover:bg-white/10 hover:text-primary hover:shadow-sm text-xs px-2 py-1.5"
              onClick={onViewDetails}
            >
              View Details
            </Button>
            <Button 
              onClick={handleAddToCart}
              disabled={isAddingToCart || isOutOfStock}
              className={`flex-1 group border-0 py-1.5 px-2 font-semibold rounded-lg transition-all duration-300 text-xs ${
                isOutOfStock 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : isInCartState 
                    ? 'bg-green-600 hover:bg-green-700 hover:shadow-glow text-white' 
                    : 'bg-gradient-primary hover:shadow-glow text-white hover:scale-105'
              }`}
            >
              {isOutOfStock ? (
                <>
                  <span className="mr-1">❌</span>
                  Out of Stock
                </>
              ) : isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                  Adding...
                </>
              ) : isInCartState ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  In Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform duration-300" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductCard;