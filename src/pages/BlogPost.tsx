import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import { blogService, type AdminBlogPost, type BlogContentBlock } from "@/services/blog";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<AdminBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentBlocks, setContentBlocks] = useState<BlogContentBlock[]>([]);

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      const data = await blogService.getBlogPostBySlug(slug);
      if (data) {
        setPost(data);
        // Parse detailed_content JSON
        if (data.detailed_content && typeof data.detailed_content === 'object') {
          const content = Array.isArray(data.detailed_content) 
            ? data.detailed_content 
            : JSON.parse(JSON.stringify(data.detailed_content));
          setContentBlocks(content as BlogContentBlock[]);
        }
      }
    } catch (error) {
      console.error("Error loading blog post:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const renderContentBlock = (block: BlogContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag 
            key={index}
            className={`font-bold text-slate-900 mb-4 mt-8 ${
              block.level === 2 ? 'text-3xl' : 
              block.level === 3 ? 'text-2xl' : 
              'text-xl'
            }`}
          >
            {block.content}
          </HeadingTag>
        );
      case 'paragraph':
        return (
          <p key={index} className="text-slate-700 mb-6 leading-relaxed text-lg">
            {block.content}
          </p>
        );
      case 'key_points':
        const points = block.content.split(',').map(p => p.trim()).filter(p => p);
        return (
          <div key={index} className="bg-orange-50 border-l-4 border-[#ef4e23] p-6 mb-6 rounded-r-lg">
            <h4 className="font-bold text-slate-900 mb-3 text-lg">Key Points:</h4>
            <ul className="space-y-2">
              {points.map((point, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-[#ef4e23] mr-2">•</span>
                  <span className="text-slate-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef4e23] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog post...</p>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section with Background Image */}
      <div 
        className="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        style={{
          backgroundImage: `url(${post.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-6">
          <div className="inline-block">
            <span className="bg-[#ef4e23] text-white px-4 py-2 rounded-full text-sm font-bold">
              {post.category_tag}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
            {post.detailed_title || post.title}
          </h1>
          
          <div className="flex items-center justify-center space-x-6 text-white/90">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(post.published_date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>{post.read_time_minutes} min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>

          {/* Detailed Content */}
          <div className="prose prose-lg max-w-none">
            {contentBlocks.length > 0 ? (
              contentBlocks.map((block, index) => renderContentBlock(block, index))
            ) : (
              <div className="text-slate-700 leading-relaxed text-lg">
                <p>{post.description}</p>
              </div>
            )}
          </div>
        </div>
      </article>

      <Footer />
    </Layout>
  );
};

export default BlogPost;
