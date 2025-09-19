import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart, Product } from "@/contexts/CartContext";
import { formatPrice } from "@/services/api";
import { toast } from "sonner";

const Wishlist = () => {
  const { state, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId);
  };

  const handleClearWishlist = () => {
    if (state.items.length > 0) {
      clearWishlist();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 px-4">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Heart className="h-12 w-12 text-red-400 fill-current animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              My Wishlist
            </h1>
          </div>
          <p className="text-xl md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
            {state.count === 0
              ? "Your wishlist is empty"
              : `${state.count} item${
                  state.count > 1 ? "s" : ""
                } in your wishlist`}
          </p>
        </div>
      </section>

      <main className="py-20">
        <div className="container mx-auto px-4">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {state.items.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleClearWishlist}
                className="text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Empty State */}
          {state.items.length === 0 ? (
            <div className="text-center py-16">
              <GlassCard intensity="medium" className="max-w-md mx-auto p-8">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start adding products you love to keep track of them!
                </p>
                <Button
                  onClick={() => navigate("/shop")}
                  className="bg-gradient-primary hover:shadow-glow text-primary-foreground"
                >
                  Browse Products
                </Button>
              </GlassCard>
            </div>
          ) : (
            /* Wishlist Items Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {state.items.map((product) => (
                <GlassCard
                  key={product.id}
                  intensity="medium"
                  animated
                  className="overflow-hidden group"
                >
                  <div className="relative">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Remove from wishlist button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-200 backdrop-blur-sm"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                        {product.category}
                      </p>
                      <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-gradient-primary hover:shadow-glow text-primary-foreground"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        className="px-3 text-destructive border-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
