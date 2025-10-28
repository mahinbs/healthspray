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
    'Cryo Recovery Gel',
    149.99,
    199.99,
    '/src/assets/robot-toy-premium.jpg',
    'Recovery Products',
    'Advanced cooling gel that provides instant relief for sore muscles and reduces inflammation after intense workouts.',
    ARRAY['Instant cooling sensation', 'Reduces muscle inflammation', 'Non-greasy formula', 'Long-lasting relief (6+ hours)', 'Athlete-safe ingredients', 'Easy application and absorption'],
    5,
    127,
    true,
    25,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.products LIMIT 1);

INSERT INTO public.products (name, price, original_price, image, category, description, features, rating, reviews, is_new, stock, is_active)
SELECT 
    'Thermo Warm-up Balm',
    89.99,
    NULL,
    '/src/assets/cat-toy-premium.jpg',
    'Warm-up Products',
    'Professional-grade warming balm designed to activate muscles and improve blood circulation before workouts.',
    ARRAY['Deep muscle warming', 'Improved blood circulation', 'Prevents muscle strains', 'Quick absorption', 'Natural menthol formula', 'Portable and convenient'],
    5,
    89,
    false,
    15,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Thermo Warm-up Balm');

INSERT INTO public.products (name, price, original_price, image, category, description, features, rating, reviews, is_new, stock, is_active)
SELECT 
    'Compression Recovery Sleeves',
    69.99,
    89.99,
    '/src/assets/puzzle-feeder-premium.jpg',
    'Compression Wear',
    'High-performance compression sleeves that enhance recovery and provide muscle support during and after training.',
    ARRAY['Targeted compression zones', 'Moisture-wicking fabric', 'Seamless construction', 'Multiple size options', 'Machine washable', 'Suitable for all sports'],
    4,
    203,
    false,
    30,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Compression Recovery Sleeves');
