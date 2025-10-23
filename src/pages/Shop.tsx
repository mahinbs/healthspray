import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Search, Filter, Grid, List } from "lucide-react";
import { productsService, convertToFrontendProduct } from "@/services/products";
import heroImage from "@/assets/hero-sports-health-bg.webp";

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

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Fetch active products from database
        const dbProducts = await productsService.getActiveProducts();
        const formattedProducts = dbProducts.map(convertToFrontendProduct);

        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query and category
  useEffect(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef4e23] 
            mx-auto mb-4"
            ></div>
            <p className="text-slate-400">Loading products...</p>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
        <img
          src={heroImage}
          alt="Shop Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="relative z-10 max-w-5xl mx-auto space-y-8 px-4">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] mb-4">
              Shop Our{" "}
              <span className="text-white font-bold">
                Products
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium mb-6">
              Premium pet care products for your beloved companions
            </h2>
            <p className="text-lg md:text-xl text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-4xl mx-auto leading-relaxed">
              Discover our collection of innovative pet toys and interactive toys designed to keep your pets happy, healthy, and entertained.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />

        <div className="relative z-10 container mx-auto px-4">
          {/* Search and Filter Controls */}
          <div className="mb-16">
            <GlassCard
              intensity="medium"
              className="p-8 border border-border/50 shadow-soft"
            >
              <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for the perfect pet toy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-card/50 hover:bg-card/70 backdrop-blur-md border border-border/50 rounded-2xl hover:border-primary/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder-muted-foreground text-foreground"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center space-x-4">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-card/50 border border-border/50 rounded-xl px-6 py-4 text-foreground hover:border-primary/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Results Count */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-lg">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {products.length}
                </span>{" "}
                products
              </p>
              {filteredProducts.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredProducts.length} amazing product
                  {filteredProducts.length !== 1 ? "s" : ""} for your pet
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <GlassCard
                intensity="light"
                className="max-w-md mx-auto p-12 border border-border/50"
              >
                <div className="text-8xl mb-6 animate-bounce-slow">🔍</div>
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Try adjusting your search or filter criteria to find the
                  perfect toy for your pet
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="bg-gradient-primary hover:shadow-glow text-primary-foreground px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Clear Filters
                </Button>
              </GlassCard>
            </div>
          ) : (
            <div
              className={`grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}
            >
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard
                    product={product}
                    onViewDetails={() => handleViewDetails(product)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Footer />
    </Layout>
  );
};
export default Shop;
