-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    image TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    features TEXT[],
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    reviews INTEGER DEFAULT 0,
    is_new BOOLEAN DEFAULT false,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON public.products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to active products
CREATE POLICY "Allow public read access to active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Create policies for admin full access (you'll need to set up proper admin authentication)
CREATE POLICY "Allow admin full access" ON public.products
    FOR ALL USING (true); -- This is a placeholder - replace with proper admin check

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products if table is empty
INSERT INTO public.products (name, price, original_price, image, category, description, features, rating, reviews, is_new, stock, is_active)
SELECT 
    'SmartPlay Robot Companion',
    149.99,
    199.99,
    '/src/assets/robot-toy-premium.jpg',
    'Interactive Robots',
    'An advanced AI-powered robot companion that adapts to your pet''s behavior and provides hours of interactive entertainment.',
    ARRAY['AI-powered adaptive play modes', 'Motion sensors and obstacle avoidance', 'LED light patterns for visual stimulation', 'Rechargeable battery (8+ hours)', 'Safe, durable materials', 'App connectivity for remote control'],
    5,
    127,
    true,
    25,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.products LIMIT 1);

INSERT INTO public.products (name, price, original_price, image, category, description, features, rating, reviews, is_new, stock, is_active)
SELECT 
    'FelineBot Interactive Cat Toy',
    89.99,
    NULL,
    '/src/assets/cat-toy-premium.jpg',
    'Cat Toys',
    'A high-tech interactive toy designed specifically for cats, featuring feathers, motion sensors, and unpredictable movement patterns.',
    ARRAY['Automatic motion detection', 'Replaceable feather attachments', 'Silent motor operation', 'Timer-based play sessions', 'Battery level indicator', 'Washable components'],
    5,
    89,
    false,
    15,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'FelineBot Interactive Cat Toy');

INSERT INTO public.products (name, price, original_price, image, category, description, features, rating, reviews, is_new, stock, is_active)
SELECT 
    'BrainBoost Puzzle Feeder',
    69.99,
    89.99,
    '/src/assets/puzzle-feeder-premium.jpg',
    'Smart Feeders',
    'Transform mealtime into a mental workout with this innovative puzzle feeder.',
    ARRAY['Adjustable difficulty levels', 'Multiple feeding compartments', 'Non-slip base design', 'Easy to clean and fill', 'Slows down eating pace', 'Suitable for all pet sizes'],
    4,
    203,
    false,
    30,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'BrainBoost Puzzle Feeder');
