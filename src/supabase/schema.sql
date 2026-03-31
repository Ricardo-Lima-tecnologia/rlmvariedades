-- ============================================
-- RLM Variedades - Supabase Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  category TEXT CHECK (category IN ('casa-inteligente','automotivo','saude-beleza','ferramentas','eletronicos','fitness','cozinha','pets')),
  price NUMERIC NOT NULL,
  compare_price NUMERIC,
  images TEXT[] DEFAULT '{}',
  video_frames TEXT[] DEFAULT '{}',
  badge TEXT CHECK (badge IN ('mais-vendido','oferta','exclusivo','novo','frete-gratis','')),
  rating NUMERIC,
  review_count INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','low_stock','out_of_stock')),
  stock_quantity INTEGER,
  variations JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '[]',
  shipping_days_min INTEGER DEFAULT 7,
  shipping_days_max INTEGER DEFAULT 15,
  free_shipping BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  best_seller BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_deal BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_cpf TEXT,
  shipping_address JSONB,
  items JSONB DEFAULT '[]',
  subtotal NUMERIC,
  shipping_cost NUMERIC,
  discount NUMERIC,
  total NUMERIC NOT NULL,
  coupon_code TEXT,
  payment_method TEXT CHECK (payment_method IN ('pix','credit_card','boleto')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  tracking_code TEXT,
  notes TEXT
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified BOOLEAN DEFAULT TRUE
);

-- ============================================
-- COUPONS
-- ============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC NOT NULL,
  min_order_value NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  uses_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at DATE
);

-- ============================================
-- Auto-update updated_date
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_date();
CREATE TRIGGER orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_date();
CREATE TRIGGER reviews_updated BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_date();
CREATE TRIGGER coupons_updated BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- ============================================
-- Row Level Security (público para loja)
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Products: leitura pública, escrita apenas autenticado
CREATE POLICY "products_read" ON products FOR SELECT USING (true);
CREATE POLICY "products_write" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Orders: qualquer um pode criar, apenas autenticado gerencia
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_read_own" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_update_auth" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Reviews: leitura pública, criação pública
CREATE POLICY "reviews_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (true);

-- Coupons: apenas autenticado
CREATE POLICY "coupons_read" ON coupons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "coupons_write" ON coupons FOR ALL USING (auth.role() = 'authenticated');