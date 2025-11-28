import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, Calendar, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { blogService, type AdminBlogPost } from "@/services/blog";

const BlogSection = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService.getActiveBlogPosts();
      setBlogPosts(data);
    } catch (error) {
      console.error("Error loading blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Physiq Insights
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl">
              Where fitness meets knowledge — insights that help you recover, recharge, and perform better.
            </p>
          </div>
          <Button
            variant="outline"
            className="hidden md:flex items-center space-x-2 bg-orange-600 text-white"
            onClick={() => navigate('/blog')}
          >
            <span>View all</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef4e23] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <GlassCard
                key={post.id}
                intensity="medium"
                className="group relative overflow-hidden rounded-2xl hover:scale-105 transition-all duration-500 hover:shadow-2xl cursor-pointer"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                {/* Blog Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#ef4e23] text-white px-3 py-1 rounded-full text-sm font-bold">
                      {post.category_tag}
                    </span>
                  </div>
                </div>

                {/* Blog Content */}
                <div className="p-6">
                  {/* Author & Date */}
                  <div className="flex items-center space-x-4 mb-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.published_date)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-[#ef4e23] transition-colors duration-300">
                    {post.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  {/* Read More Link */}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/blog/${post.slug}`);
                      }}
                      className="text-[#ef4e23] font-semibold hover:text-[#ef4e23]/80 transition-colors duration-300 flex items-center space-x-1 group"
                    >
                      <span>Read more</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                    <span className="text-sm text-slate-500">{post.read_time_minutes} min read</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="text-center mt-8 md:hidden">
          <Button
            variant="outline"
            className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
            onClick={() => navigate('/blog')}
          >
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
