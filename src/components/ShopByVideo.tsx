import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ShoppingCart, Heart, X, Play, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { productsService, type AdminProduct } from "@/services/products";
import { toast } from "sonner";

const ShopByVideo = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Load products with videos from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsWithVideos = await productsService.getProductsWithVideos();
        setProducts(productsWithVideos.slice(0, 6)); // Show first 6 products with videos
      } catch (error) {
        console.error('Error loading products with videos:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // No autoplay: play only on hover; pause/reset on mouse leave

  const handleAddToCart = (product: AdminProduct) => {
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.image) ? product.image[0] : product.image,
        category: product.category,
        description: product.description,
        rating: product.rating,
        reviews: product.reviews,
        isNew: product.is_new
      });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleToggleWishlist = (product: AdminProduct) => {
    try {
      const productData = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.image) ? product.image[0] : product.image,
        category: product.category,
        description: product.description,
        rating: product.rating,
        reviews: product.reviews,
        isNew: product.is_new
      };
      
      toggleWishlist(productData);
      
      if (isInWishlist(product.id)) {
        toast.success(`${product.name} removed from wishlist!`);
      } else {
        toast.success(`${product.name} added to wishlist!`);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleVideoClick = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsVideoModalOpen(true);
    setIsVideoPlaying(false);
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedProduct(null);
    setIsVideoPlaying(false);
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
  };

  const handleVideoPlayPause = () => {
    if (modalVideoRef.current) {
      if (isVideoPlaying) {
        modalVideoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        modalVideoRef.current.play();
        setIsVideoPlaying(true);
      }
    }
  };


  // Don't render the section if there are no products with videos (and not loading)
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Shop by <span className="bg-gradient-to-r from-[#ef4e23] to-[#ef4e23] bg-clip-text text-transparent">Video</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            See our products in action. Watch real athletes using our sports health solutions for peak performance.
          </p>
        </div>

        {/* Video Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <GlassCard key={index} intensity="medium" className="animate-pulse">
                <div className="aspect-[3/4] bg-slate-200 rounded-2xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </div>
              </GlassCard>
            ))
          ) : (
            products.map((product) => {
              const discount = product.original_price 
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0;
              
              return (
                <GlassCard
                  key={product.id}
                  intensity="medium"
                  className="group relative overflow-hidden rounded-2xl hover:scale-105 transition-all duration-500 hover:shadow-2xl flex flex-col h-full"
                >
                  {/* Video Thumbnail */}
                  <div 
                    className="relative aspect-square overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => handleVideoClick(product)}
                    onMouseEnter={() => {
                      const v = videoRefs.current[product.id];
                      if (v) {
                        v.currentTime = 0;
                        v.play().catch(() => {});
                      }
                    }}
                    onMouseLeave={() => {
                      const v = videoRefs.current[product.id];
                      if (v) {
                        v.pause();
                        v.currentTime = 0;
                      }
                    }}
                  >
                    {/* Thumbnail shows when not hovering; we stack image under the video and fade */}
                    {product.video_thumbnail && (
                      <img
                        src={product.video_thumbnail}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    {product.video_url ? (
                      <video
                        ref={(el) => (videoRefs.current[product.id] = el)}
                        src={product.video_url}
                        className="relative w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        style={{ backgroundColor: product.video_thumbnail ? 'transparent' : '#e5e7eb' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No video available</span>
                      </div>
                    )}
                    
                    {/* No play overlay in card view */}
                    
                    {/* Video Title Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg drop-shadow-lg">
                        {product.category}
                      </h3>
                    </div>

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-[#ef4e23] text-white px-3 py-1 rounded-full text-sm font-bold">
                          {discount}% Off
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="space-y-4 flex-grow">
                      <h4 className="font-semibold text-slate-900 text-lg leading-tight min-h-[3.5rem] flex items-start">
                        {product.name}
                      </h4>
                      
                      <p className="text-slate-600 text-sm min-h-[2.5rem] flex items-start">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-[#ef4e23]">
                          ₹{product.price}
                        </span>
                        {product.original_price && (
                          <span className="text-lg text-slate-400 line-through">
                            ₹{product.original_price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-6">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-gradient-to-r from-[#ef4e23] to-[#ef4e23] hover:from-[#ef4e23]/90 hover:to-[#ef4e23]/90 text-white border-0 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleWishlist(product)}
                        className={`${
                          isInWishlist(product.id)
                            ? "bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
                            : "border-[#ef4e23] text-[#ef4e23] hover:bg-[#ef4e23] hover:text-white"
                        } rounded-xl transition-all duration-300 hover:scale-105`}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-white" : ""}`} />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            className="bg-gradient-to-r from-[#ef4e23] to-[#ef4e23] hover:from-[#ef4e23]/90 hover:to-[#ef4e23]/90 text-white border-0 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            View All Videos
          </Button>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors duration-300"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Video Container */}
            <div className="relative aspect-video bg-black">
              {selectedProduct.video_url ? (
                <video
                  ref={modalVideoRef}
                  src={selectedProduct.video_url}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <span>No video available</span>
                </div>
              )}
              
              {/* Play/Pause Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handleVideoPlayPause}
                  className="bg-white/90 hover:bg-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110"
                >
                  {isVideoPlaying ? (
                    <Pause className="h-8 w-8 text-[#ef4e23]" />
                  ) : (
                    <Play className="h-8 w-8 text-[#ef4e23]" />
                  )}
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {selectedProduct.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-3xl font-bold text-[#ef4e23]">
                      ₹{selectedProduct.price}
                    </span>
                    {selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price && (
                      <span className="text-xl text-slate-400 line-through">
                        ₹{selectedProduct.original_price}
                      </span>
                    )}
                  </div>
                  {selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price && (
                    <div className="bg-[#ef4e23] text-white px-3 py-1 rounded-full text-sm font-bold inline-block">
                      {Math.round(((selectedProduct.original_price - selectedProduct.price) / selectedProduct.original_price) * 100)}% Off
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="flex-1 bg-gradient-to-r from-[#ef4e23] to-[#ef4e23] hover:from-[#ef4e23]/90 hover:to-[#ef4e23]/90 text-white border-0 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleToggleWishlist(selectedProduct)}
                  className={`${
                    isInWishlist(selectedProduct.id)
                      ? "bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
                      : "border-[#ef4e23] text-[#ef4e23] hover:bg-[#ef4e23] hover:text-white"
                  } rounded-xl transition-all duration-300 hover:scale-105 px-6`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(selectedProduct.id) ? "fill-white" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShopByVideo;