import { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import { GlassCard } from "@/components/ui/glass-card";
import { productsService, convertToFrontendProduct } from "@/services/products";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
  features?: string[];
  rating: number;
  reviews: number;
  isNew?: boolean;
}

const ProductShowcase = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // First try to get featured products
        console.log("ProductShowcase: Fetching featured products...");
        const featuredProducts = await productsService.getFeaturedProducts();
        console.log(
          "ProductShowcase: Featured products from DB:",
          featuredProducts
        );

        if (featuredProducts && featuredProducts.length > 0) {
          // Convert featured products to frontend format
          const formattedFeatured = featuredProducts
            .map((fp) => {
              if (fp && fp.product) {
                console.log(
                  "ProductShowcase: Converting featured product:",
                  fp.product
                );
                return convertToFrontendProduct(fp.product);
              }
              return null;
            })
            .filter(Boolean);

          console.log(
            "ProductShowcase: Formatted featured products:",
            formattedFeatured
          );

          if (formattedFeatured.length > 0) {
            setProducts(formattedFeatured);
            return;
          }
        }

        // Fallback to regular products if no featured products
        console.log(
          "ProductShowcase: No featured products, fetching active products..."
        );
        const dbProducts = await productsService.getActiveProducts();
        console.log("ProductShowcase: Active products from DB:", dbProducts);

        if (dbProducts && dbProducts.length > 0) {
          const formattedProducts = dbProducts.map(convertToFrontendProduct);
          console.log(
            "ProductShowcase: Formatted active products:",
            formattedProducts
          );
          // Show only first 4 products for featured section
          setProducts(formattedProducts.slice(0, 4));
        } else {
          console.warn("No products found");
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to regular products on error
        try {
          const dbProducts = await productsService.getActiveProducts();
          if (dbProducts && dbProducts.length > 0) {
            const formattedProducts = dbProducts.map(convertToFrontendProduct);
            setProducts(formattedProducts.slice(0, 4));
          } else {
            setProducts([]);
          }
        } catch (fallbackError) {
          console.error("Error fetching fallback products:", fallbackError);
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
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

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <section id="products" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl" />

        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading featured products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl" />

      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Featured Products
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Discover advanced recovery formulas that help you train harder and
            recover faster.
          </p>
        </div>
        {products.length > 0 ? (
          isMobile ? (
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {products.map((product, index) => (
                  <div key={product.id} className="w-full flex-shrink-0 px-2">
                    <div
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <ProductCard
                        product={product}
                        onViewDetails={() => handleViewDetails(product)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`${
                products.length <= 2
                  ? "flex flex-wrap justify-center gap-10"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
              } max-w-7xl mx-auto`}
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`animate-slide-up w-full ${products.length <= 2 ? "md:w-1/4" : ""}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <ProductCard
                    product={product}
                    onViewDetails={() => handleViewDetails(product)}
                  />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              No Featured Products
            </h3>
            <p className="text-slate-500">
              Check back soon for our latest products!
            </p>
          </div>
        )}
      </div>
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};
export default ProductShowcase;
