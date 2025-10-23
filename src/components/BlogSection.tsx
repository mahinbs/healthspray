import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, Calendar, User } from "lucide-react";

const BlogSection = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Active vs. Passive Recovery: Which One Is Better for You?",
      description: "Active vs. Passive Recovery: Which One Is Better for You? The right recovery method can make all the difference in your athletic performance.",
      author: "Sandhya Seshadri",
      date: "11 March 2025",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop&crop=center",
      readTime: "5 min read",
      category: "Recovery"
    },
    {
      id: 2,
      title: "Epsom Salt: The Secret Weapon for Athlete Recovery",
      description: "Are you an athlete or fitness enthusiast looking for the ultimate recovery solution? Discover the power of Epsom salt.",
      author: "Heena Baig",
      date: "06 November 2024",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop&crop=center",
      readTime: "7 min read",
      category: "Recovery"
    },
    {
      id: 3,
      title: "Dynamic Duo of Active and Passive Recovery",
      description: "In the world of sports, we often hear the mantra 'no pain, no gain.' But what about recovery? Learn the perfect balance.",
      author: "Heena Baig",
      date: "13 December 2023",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=300&fit=crop&crop=center",
      readTime: "6 min read",
      category: "Training"
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Learn
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl">
              Expert insights, recovery tips, and training advice to help you perform at your best.
            </p>
          </div>
          <Button
            variant="outline"
            className="hidden md:flex items-center space-x-2 bg-orange-600 text-white"
          >
            <span>View all</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <GlassCard
              key={post.id}
              intensity="medium"
              className="group relative overflow-hidden rounded-2xl hover:scale-105 transition-all duration-500 hover:shadow-2xl"
            >
              {/* Blog Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#ef4e23] text-white px-3 py-1 rounded-full text-sm font-bold">
                    {post.category}
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
                    <span>{post.date}</span>
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
                  <button className="text-[#ef4e23] font-semibold hover:text-[#ef4e23]/80 transition-colors duration-300 flex items-center space-x-1 group">
                    <span>Read more</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                  <span className="text-sm text-slate-500">{post.readTime}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-8 md:hidden">
          <Button
            variant="outline"
            className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
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
