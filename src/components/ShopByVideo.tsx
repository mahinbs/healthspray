import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  ShoppingCart,
  Heart,
  X,
  Play,
  Pause,
  Send,
  Eye,
  ExternalLink,
  VolumeX,
  Volume2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { productsService, type AdminProduct } from "@/services/products";
import { toast } from "sonner";

const ShopByVideo = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
    null
  );
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isSectionInView, setIsSectionInView] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Load products with videos from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsWithVideos =
          await productsService.getProductsWithVideos();
        setProducts(productsWithVideos.slice(0, 6)); // Show first 6 products with videos
      } catch (error) {
        console.error("Error loading products with videos:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Autoplay videos when section is in view (like reference site)

  useEffect(() => {
    if (!sectionRef.current || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSectionInView(entry.isIntersecting);
        });
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const videos = Object.values(videoRefs.current);

    videos.forEach((video) => {
      if (!video) return;

      if (isSectionInView) {
        video
          .play()
          .then(() => {
            // Autoplay started
          })
          .catch(() => {
            // Ignore autoplay restrictions errors
          });
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [isSectionInView, products.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleChange = () => setIsMobile(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isMobile || products.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isMobile, products.length]);

  useEffect(() => {
    if (currentSlide >= products.length) {
      setCurrentSlide(0);
    }
  }, [products.length, currentSlide]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      return;
    }

    const delta = touchStartX.current - touchEndX.current;
    const threshold = 40;

    if (delta > threshold) {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    } else if (delta < -threshold) {
      setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

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
        isNew: product.is_new,
      });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart");
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
        isNew: product.is_new,
      };

      toggleWishlist(productData);

      if (isInWishlist(product.id)) {
        toast.success(`${product.name} removed from wishlist!`);
      } else {
        toast.success(`${product.name} added to wishlist!`);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  const handleVideoClick = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsVideoModalOpen(true);
    setIsVideoPlaying(false);
    setIsMuted(true);
    setShowVideoControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  };

  const handleShare = (product: AdminProduct) => {
    try {
      const shareUrl = window.location.href;

      if (navigator.share) {
        navigator
          .share({
            title: product.name,
            text: product.description ?? "",
            url: shareUrl,
          })
          .catch(() => {
            // User dismissed share dialog, ignore
          });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => toast.success("Link copied to clipboard"))
          .catch(() => { });
      }
    } catch (error) {
      console.error("Error sharing product:", error);
      toast.error("Unable to share right now");
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  useEffect(() => {
    if (modalVideoRef.current) {
      modalVideoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedProduct(null);
    setIsVideoPlaying(false);
    setShowVideoControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
  };

  const handleVideoMouseEnter = () => {
    setShowVideoControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  };

  const handleVideoMouseLeave = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowVideoControls(false);
    }, 1500);
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

  const renderVideoCard = (product: AdminProduct) => {
    const discount = product.original_price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) *
            100
        )
      : 0;

    return (
      <GlassCard
        intensity="medium"
        className="group relative overflow-hidden rounded-2xl hover:scale-105 transition-all duration-500 hover:shadow-2xl flex flex-col h-full"
      >
        {/* Video Thumbnail */}
        <div
          className="relative aspect-[9/13] overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={() => handleVideoClick(product)}
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
              style={{
                backgroundColor: product.video_thumbnail
                  ? "transparent"
                  : "#e5e7eb",
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
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
                  ? "bg-[#ef4e23] border-[#ef4e23] text-white hover:bg-[#ef4e23]/90 hover:border-[#ef4e23]/90"
                  : "border-[#ef4e23] text-[#ef4e23] hover:bg-[#ef4e23] hover:text-white"
              } rounded-xl transition-all duration-300 hover:scale-105`}
            >
              <Heart
                className={`h-4 w-4 ${
                  isInWishlist(product.id) ? "fill-white" : ""
                }`}
              />
            </Button>
          </div>
        </div>
      </GlassCard>
    );
  };

  // Don't render the section if there are no products with videos (and not loading)
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Shop by <span className="text-[#ef4e23] font-bold">Video</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            See every product in action before you buy.
          </p>
        </div>

        {/* Video Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <GlassCard
                key={index}
                intensity="medium"
                className="animate-pulse"
              >
                <div className="aspect-[3/4] bg-gray-100 rounded-2xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-100 rounded"></div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : isMobile ? (
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {products.map((product) => (
                <div key={product.id} className="w-full flex-shrink-0 px-2">
                  {renderVideoCard(product)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`${
              products.length <= 2
                ? "flex flex-wrap justify-center gap-10"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            } max-w-7xl mx-auto`}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className={`w-full ${
                  products.length <= 2 ? "md:w-1/3 max-w-sm" : ""
                }`}
              >
                {renderVideoCard(product)}
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button className="bg-gradient-to-r from-[#ef4e23] to-[#ef4e23] hover:from-[#ef4e23]/90 hover:to-[#ef4e23]/90 text-white border-0 px-10 py-6 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
            View All Videos
          </Button>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-sm bg-black rounded-3xl overflow-hidden shadow-2xl max-h-[90vh]">
            {/* Top Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors duration-200"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Container */}
            <div
              className="relative aspect-[9/13] bg-black"
              onMouseEnter={handleVideoMouseEnter}
              onMouseLeave={handleVideoMouseLeave}
            >
              {selectedProduct.video_url ? (
                <video
                  ref={modalVideoRef}
                  src={selectedProduct.video_url}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  muted={isMuted}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <span>No video available</span>
                </div>
              )}

              {/* Center Play/Pause Button */}
              <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showVideoControls ? "opacity-100" : "opacity-0"
                  }`}
              >
                <button
                  onClick={handleVideoPlayPause}
                  className="bg-white/90 hover:bg-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 pointer-events-auto"
                >
                  {isVideoPlaying ? (
                    <Pause className="h-8 w-8 text-[#ef4e23]" />
                  ) : (
                    <Play className="h-8 w-8 text-[#ef4e23]" />
                  )}
                </button>
              </div>
              {/* Right-side action buttons (views, wishlist, share, cart) */}
              <div
                className={`absolute top-16 right-4 flex flex-col items-center space-y-4 text-white bg-black/40 p-2 rounded-xl transition-opacity duration-300 ${showVideoControls ? "opacity-100" : "opacity-0"
                  }`}
              >
                <div className="flex flex-col items-center">
                  <div className="font-semibold text-base">
                    {selectedProduct.reviews ?? 0}
                  </div>
                  <div className="uppercase tracking-wide text-[10px]">
                    Views
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleToggleWishlist(selectedProduct)}
                    className={`${isInWishlist(selectedProduct.id)
                      ? "text-[#ef4e23]"
                      : "text-white"
                      }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${isInWishlist(selectedProduct.id) ? "fill-[#ef4e23]" : ""
                        }`}
                    />
                  </button>
                  <span className="text-[12px] font-semibold mt-1">
                    {selectedProduct.rating ?? 0}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleShare(selectedProduct)}
                    className=""
                  >
                    <Send className="h-5 w-5" />
                  </button>
                  <span className="text-[12px] font-semibold mt-1">
                    {(selectedProduct.features?.length ?? 0) || 1}
                  </span>
                </div>
                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="mt-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>
              </div>

              {/* Bottom product info + Buy Now button */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                <div className="flex items-end justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* {selectedProduct.image && (
                      <img
                        src={
                          Array.isArray(selectedProduct.image)
                            ? selectedProduct.image[0]
                            : selectedProduct.image
                        }
                        alt={selectedProduct.name}
                        className="w-12 h-12 rounded-full object-cover border border-white/20"
                      />
                    )} */}
                    <div className="text-white">
                      <p className="text-xs uppercase tracking-wide text-white/80">
                        {selectedProduct.category}
                      </p>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">
                          {selectedProduct.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-lg font-bold">
                          ₹{selectedProduct.price}
                        </span>
                        {selectedProduct.original_price &&
                          selectedProduct.original_price >
                          selectedProduct.price && (
                            <>
                              <span className="text-white/70 line-through">
                                ₹{selectedProduct.original_price}
                              </span>
                              <span className="text-teal-300 font-semibold">
                                {Math.round(
                                  ((selectedProduct.original_price -
                                    selectedProduct.price) /
                                    selectedProduct.original_price) *
                                  100
                                )}
                                % Off
                              </span>
                            </>
                          )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="bg-primary hover:bg-primary/90 text-white border-0 px-8 py-4 rounded-2xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShopByVideo;
