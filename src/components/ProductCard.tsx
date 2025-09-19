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
    setIsAddingToCart(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    addItem(product);
    setIsAddingToCart(false);
  };

  const cartQuantity = getItemQuantity(product.id);
  const isInCartState = isInCart(product.id);
  const isLiked = isInWishlist(product.id);

  return (
    <GlassCard 
      intensity="medium" 
      animated
      className="group overflow-hidden transition-all duration-500 hover:shadow-float"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-0">
        <div className="relative overflow-hidden rounded-t-2xl">
          <img 
            src={product.image} 
            alt={product.name}
            className={`w-full object-cover aspect-square transition-all duration-700 ${
              isHovered ? 'scale-110 brightness-110' : 'scale-100'
            }`}
          />
          
          {/* Floating Badges */}
          <div className="absolute z-10 top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-gradient-primary text-white shadow-glow animate-pulse-slow">
                ✨ New
              </Badge>
            )}
            {product.originalPrice && (
              <Badge variant="destructive" className="shadow-glow">
                Sale
              </Badge>
            )}
            {isInCartState && (
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
              isLiked ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          {/* Overlay on Hover */}
          <div className={`absolute inset-0 bg-gradient-primary/20 backdrop-blur-sm transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-primary font-semibold uppercase tracking-wider">{product.category}</p>
            <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 transition-colors duration-300 ${
                    i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">({product.reviews} reviews)</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-white/20 text-foreground hover:bg-white/10 hover:text-primary hover:shadow-sm"
              onClick={onViewDetails}
            >
              View Details
            </Button>
            <Button 
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`flex-1 group bg-gradient-primary hover:shadow-glow text-white border-0 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${
                isInCartState ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
            >
              {isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding...
                </>
              ) : isInCartState ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  In Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
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