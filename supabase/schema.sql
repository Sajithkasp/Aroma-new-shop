-- ====================================================================
-- AROMA PERFUMES SRI LANKA - SUPABASE POSTGRESQL SCHEMA
-- Artisanal Haute Parfumerie & Full E-Commerce Storefront
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  compare_price NUMERIC(10, 2),
  cost_price NUMERIC(10, 2),
  stock INTEGER DEFAULT 50,
  sku TEXT,
  barcode TEXT,
  category_id TEXT,
  type_id TEXT,
  image_url TEXT,
  volume_ml INTEGER DEFAULT 50,
  fragrance_notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,
  district TEXT DEFAULT 'Colombo',
  payment_method TEXT DEFAULT 'Cash on Delivery (COD)',
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'confirmed',
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  shipping_fee NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  items_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  volume_ml INTEGER DEFAULT 50,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  subtotal NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REVIEWS & TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  avatar_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main-settings',
  site_name TEXT DEFAULT 'Aroma Perfumes Sri Lanka',
  brand_name TEXT DEFAULT 'AROMA',
  tagline TEXT DEFAULT 'Artisanal Sri Lankan Haute Parfumerie',
  logo_url TEXT,
  favicon_url TEXT,
  contact_email TEXT DEFAULT 'concierge@aroma.lk',
  contact_phone TEXT DEFAULT '+94 77 123 4567',
  whatsapp_number TEXT DEFAULT '+94771234567',
  atelier_address TEXT DEFAULT 'No. 45, Ward Place, Colombo 07, Sri Lanka',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HERO SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.hero_sections (
  id TEXT PRIMARY KEY DEFAULT 'slide-1',
  title TEXT NOT NULL,
  subtitle TEXT,
  badge_text TEXT,
  description TEXT,
  media_type TEXT DEFAULT 'image',
  image_url TEXT,
  video_url TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '#fragrance-catalog',
  sort_order INTEGER DEFAULT 1,
  duration INTEGER DEFAULT 6,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ANNOUNCEMENT BARS TABLE
CREATE TABLE IF NOT EXISTS public.announcement_bars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  link_url TEXT DEFAULT '/products',
  link_text TEXT DEFAULT 'Shop Now',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SEO SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id TEXT PRIMARY KEY DEFAULT 'main-seo',
  meta_title TEXT DEFAULT 'Aroma Perfumes | Artisanal Ceylon Haute Parfumerie',
  meta_description TEXT DEFAULT 'Discover handcrafted Extrait de Parfum infused with ancient Ceylon Agarwood, organic cinnamon quills, and rare Indian Ocean resins.',
  keywords TEXT DEFAULT 'aroma perfumes, ceylon oud, sri lanka perfume, colombo fragrances',
  og_image_url TEXT,
  canonical_url TEXT DEFAULT 'https://aromaperfumes.lk',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC(10, 2) NOT NULL,
  min_spend NUMERIC(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSERT SEED DATA
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_spend)
VALUES ('AROMA10', 'Welcome 10% Discount on First Flacon', 'percentage', 10, 0)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.site_settings (id, brand_name, tagline, contact_email, contact_phone, whatsapp_number, atelier_address)
VALUES ('main-settings', 'AROMA', 'Artisanal Sri Lankan Haute Parfumerie', 'concierge@aroma.lk', '+94 77 123 4567', '+94771234567', 'No. 45, Ward Place, Colombo 07, Sri Lanka')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hero_sections (id, title, subtitle, badge_text, description, image_url, cta_text, cta_link, sort_order)
VALUES 
  ('slide-1', 'CEYLON\nROYAL OUD', 'EXTRAIT DE PARFUM · 35% OIL CONCENTRATION', 'HANDCRAFTED IN SRI LANKA', 'Distilled from sustainably sourced ancient Ceylon Agarwood, enriched with sun-warmed organic cinnamon bark, dark patchouli, and golden smoked amber.', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&auto=format&fit=crop&q=85', 'Explore Royal Oud', '#fragrance-catalog', 1),
  ('slide-2', 'MIDNIGHT\nCINNAMON NOIR', 'AN OLFACTORY ODE TO THE SPICE ISLAND', 'PRIVATE RESERVE 2026', 'Pure organic Ceylon cinnamon quill absolute married with French damask rose, smoked Madagascar vanilla, and velvet Haitian vetiver.', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1600&auto=format&fit=crop&q=85', 'Discover Noir Series', '#fragrance-catalog', 2),
  ('slide-3', 'AQUA DE\nCEYLON', 'CRISP OCEAN MIST & SUNLIT AMBERGRIS', 'TROPICAL SIGNATURE', 'Vibrant Indian Ocean sea spray blended with crushed green bergamot, coastal driftwood, and sparkling white musk crafted for 14-hour tropical wear.', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1600&auto=format&fit=crop&q=85', 'Shop Summer Breeze', '#fragrance-catalog', 3)
ON CONFLICT (id) DO NOTHING;

-- RLS POLICIES (PUBLIC READ, AUTH/PUBLIC INSERT FOR ORDERS & REVIEWS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own orders" ON public.orders FOR SELECT USING (true);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
