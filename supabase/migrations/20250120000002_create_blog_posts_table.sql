-- Create blog_posts table for managing Physiq Insights blog section
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  published_date DATE NOT NULL,
  image_url TEXT NOT NULL,
  category_tag TEXT NOT NULL,
  read_time_minutes INTEGER DEFAULT 5,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Detailed content fields
  detailed_title TEXT,
  detailed_content JSONB DEFAULT '[]'::jsonb, -- Array of content blocks: {type: 'heading'|'paragraph'|'key_points', content: string, level?: number}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_active ON public.blog_posts(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_posts_display_order ON public.blog_posts(display_order);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON public.blog_posts(published_date DESC);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read access for active blog posts
CREATE POLICY "Public read access for active blog posts" ON public.blog_posts
  FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admin full access to blog posts" ON public.blog_posts
  FOR ALL USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Insert default blog posts
INSERT INTO public.blog_posts (
  title, 
  description, 
  author, 
  published_date, 
  image_url, 
  category_tag, 
  read_time_minutes, 
  slug,
  detailed_title,
  detailed_content,
  display_order,
  is_active
)
VALUES
  (
    'Active vs. Passive Recovery: Which One Is Better for You?',
    'Active vs. Passive Recovery: Which One Is Better for You? The right recovery method can make all the difference in your athletic performance.',
    'Sandhya Seshadri',
    '2025-03-11',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop&crop=center',
    'Recovery',
    5,
    'active-vs-passive-recovery',
    'Active vs. Passive Recovery: Which One Is Better for You?',
    '[
      {"type": "heading", "content": "Understanding Recovery Methods", "level": 2},
      {"type": "paragraph", "content": "Recovery is an essential part of any training program. Understanding the difference between active and passive recovery can help you optimize your performance."},
      {"type": "heading", "content": "What is Active Recovery?", "level": 2},
      {"type": "paragraph", "content": "Active recovery involves low-intensity exercises that help your body recover while still moving."},
      {"type": "key_points", "content": "Benefits of Active Recovery: Improved blood circulation, Reduced muscle stiffness, Faster recovery time"},
      {"type": "heading", "content": "What is Passive Recovery?", "level": 2},
      {"type": "paragraph", "content": "Passive recovery means complete rest with no physical activity."},
      {"type": "key_points", "content": "When to Use Passive Recovery: After intense workouts, When injured, During rest days"}
    ]'::jsonb,
    1,
    true
  ),
  (
    'Epsom Salt: The Secret Weapon for Athlete Recovery',
    'Are you an athlete or fitness enthusiast looking for the ultimate recovery solution? Discover the power of Epsom salt.',
    'Heena Baig',
    '2024-11-06',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop&crop=center',
    'Recovery',
    7,
    'epsom-salt-secret-weapon-athlete-recovery',
    'Epsom Salt: The Secret Weapon for Athlete Recovery',
    '[
      {"type": "heading", "content": "Introduction to Epsom Salt", "level": 2},
      {"type": "paragraph", "content": "Epsom salt has been used for centuries as a natural remedy for muscle recovery and relaxation."},
      {"type": "heading", "content": "Benefits for Athletes", "level": 2},
      {"type": "key_points", "content": "Key Benefits: Reduces muscle soreness, Improves sleep quality, Promotes relaxation"},
      {"type": "heading", "content": "How to Use Epsom Salt", "level": 2},
      {"type": "paragraph", "content": "Add 2 cups of Epsom salt to warm bath water and soak for 15-20 minutes after workouts."}
    ]'::jsonb,
    2,
    true
  ),
  (
    'Dynamic Duo of Active and Passive Recovery',
    'In the world of sports, we often hear the mantra "no pain, no gain." But what about recovery? Learn the perfect balance.',
    'Heena Baig',
    '2023-12-13',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=300&fit=crop&crop=center',
    'Training',
    6,
    'dynamic-duo-active-passive-recovery',
    'Dynamic Duo of Active and Passive Recovery',
    '[
      {"type": "heading", "content": "The Perfect Balance", "level": 2},
      {"type": "paragraph", "content": "Finding the right balance between active and passive recovery is key to optimal performance."},
      {"type": "heading", "content": "Creating Your Recovery Plan", "level": 2},
      {"type": "key_points", "content": "Recovery Strategy: Alternate between active and passive days, Listen to your body, Adjust based on workout intensity"},
      {"type": "heading", "content": "Conclusion", "level": 2},
      {"type": "paragraph", "content": "Both recovery methods have their place in a well-rounded training program."}
    ]'::jsonb,
    3,
    true
  )
ON CONFLICT (slug) DO NOTHING;
