import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { categoriesService, type AdminCategory } from "@/services/categories";

const CategoryShowcase = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getActiveCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/shop?category=${categorySlug}`);
  };

  const getGradientClass = (from?: string | null, to?: string | null) => {
    if (!from || !to) return "from-gray-500 to-gray-600";
    return `from-${from} to-${to}`;
  };

  // Helper function to resolve image paths
  const getImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return '';
    
    // If it's already a full URL, return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a path starting with src/assets, try to resolve it
    // In Vite, assets in src/assets need to be imported, but we can try the path
    // For now, we'll use the path as-is and let the browser resolve it
    if (imageUrl.startsWith('src/assets/') || imageUrl.startsWith('/src/assets/')) {
      // Remove leading slash if present
      const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
      return `/${cleanPath}`;
    }
    
    // If it starts with /, return as-is
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // Otherwise, prepend / to make it relative to root
    return `/${imageUrl}`;
  };

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-3xl" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Shop by{" "}
            <span className="text-[#ef4e23] font-bold">
              Category
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
            Fuel every phase of your fitness — from warm-up to recovery.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef4e23] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No categories available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-8xl mx-auto">
            {categories.map((category) => {
              const gradientClass = getGradientClass(category.gradient_from, category.gradient_to);
              return (
                <GlassCard
                  key={category.id}
                  intensity="medium"
                  animated
                  className="group overflow-hidden transition-all duration-500 hover:shadow-float cursor-pointer"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  <div 
                    className="relative h-96 overflow-hidden bg-cover bg-center bg-no-repeat"
                    style={{ 
                      backgroundImage: category.background_image_url 
                        ? `url(${getImageUrl(category.background_image_url)})` 
                        : `linear-gradient(to bottom right, var(--${category.gradient_from || 'gray-500'}), var(--${category.gradient_to || 'gray-600'}))`
                    }}
                  >
                    {/* Dark Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-black/40" />
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                      <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full blur-lg" />
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                    </div>

                    {/* Category Title */}
                    <div className="absolute bottom-10 left-10 right-10">
                      <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-white/90 text-lg mb-8 drop-shadow-md">
                          {category.description}
                        </p>
                      )}
                      
                      {/* Arrow Icon */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {category.product_tags && category.product_tags.slice(0, 2).map((product, idx) => (
                            <span
                              key={idx}
                              className="text-base bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90"
                            >
                              {product}
                            </span>
                          ))}
                          {category.product_tags && category.product_tags.length > 2 && (
                            <span className="text-base bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90">
                              +{category.product_tags.length - 2} more
                            </span>
                          )}
                        </div>
                        <ArrowRight className="h-6 w-6 text-white/80 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate("/shop")}
            variant="outline"
            size="lg"
            className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-foreground hover:text-primary px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            View All Categories
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
