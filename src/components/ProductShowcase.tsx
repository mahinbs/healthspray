import { useState, useEffect } from "react";
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

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch active products from database
        const dbProducts = await productsService.getActiveProducts();
        const formattedProducts = dbProducts.map(convertToFrontendProduct);
        
        // Show only first 3 products for featured section
        setProducts(formattedProducts.slice(0, 3));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <section id="products" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="absolute inset-0 bg-muted/50 backdrop-blur-3xl" />
        
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
      <div className="absolute inset-0 bg-muted/50 backdrop-blur-3xl" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Featured Products
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Explore our top-rated interactive toys designed to bring enrichment to your pet's life.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <ProductCard 
                product={product} 
                onViewDetails={() => handleViewDetails(product)} 
              />
            </div>
          ))}
        </div>
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