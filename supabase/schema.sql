-- Recipe Sharing Platform Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view categories
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
  ('Breakfast', 'breakfast'),
  ('Lunch', 'lunch'),
  ('Dinner', 'dinner'),
  ('Desserts', 'desserts'),
  ('Appetizers', 'appetizers'),
  ('Snacks', 'snacks'),
  ('Beverages', 'beverages'),
  ('Salads', 'salads'),
  ('Soups', 'soups'),
  ('Vegetarian', 'vegetarian'),
  ('Vegan', 'vegan'),
  ('Gluten-Free', 'gluten-free')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. RECIPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes USING gin(to_tsvector('english', title));

-- Enable RLS on recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policies for recipes
CREATE POLICY "Public recipes are viewable by everyone"
  ON recipes FOR SELECT
  USING (true);

CREATE POLICY "Users can create recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. INGREDIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  quantity VARCHAR(50),
  unit VARCHAR(20),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_order ON ingredients(recipe_id, order_index);

-- Enable RLS on ingredients
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

-- Policies for ingredients
CREATE POLICY "Ingredients are viewable by everyone"
  ON ingredients FOR SELECT
  USING (true);

CREATE POLICY "Recipe owners can manage ingredients"
  ON ingredients FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM recipes WHERE id = recipe_id
    )
  );

-- ============================================
-- 5. STEPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_step_per_recipe UNIQUE(recipe_id, step_number)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_steps_recipe_id ON steps(recipe_id);
CREATE INDEX IF NOT EXISTS idx_steps_order ON steps(recipe_id, step_number);

-- Enable RLS on steps
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

-- Policies for steps
CREATE POLICY "Steps are viewable by everyone"
  ON steps FOR SELECT
  USING (true);

CREATE POLICY "Recipe owners can manage steps"
  ON steps FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM recipes WHERE id = recipe_id
    )
  );

-- ============================================
-- 6. RECIPE_VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recipe_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_recipe_vote UNIQUE(recipe_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_recipe_votes_recipe_id ON recipe_votes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_votes_user_id ON recipe_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_votes_type ON recipe_votes(recipe_id, vote_type);

-- Enable RLS on recipe_votes
ALTER TABLE recipe_votes ENABLE ROW LEVEL SECURITY;

-- Policies for recipe_votes
CREATE POLICY "Votes are viewable by everyone"
  ON recipe_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own votes"
  ON recipe_votes FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 7. FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for recipes updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for recipe_votes updated_at
CREATE TRIGGER update_recipe_votes_updated_at
  BEFORE UPDATE ON recipe_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. STORAGE BUCKET FOR RECIPE IMAGES
-- ============================================
-- Note: This needs to be created in Supabase Dashboard > Storage
-- Or via the Storage API
-- Bucket name: 'recipe-images'
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

-- Storage policies (run these after creating the bucket)
-- Allow public read access
-- CREATE POLICY "Public Access"
-- ON STORAGE.objects FOR SELECT
-- USING (bucket_id = 'recipe-images');

-- Allow authenticated users to upload
-- CREATE POLICY "Authenticated users can upload"
-- ON STORAGE.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'recipe-images' AND
--   auth.role() = 'authenticated'
-- );

-- Allow users to update their own uploads
-- CREATE POLICY "Users can update own uploads"
-- ON STORAGE.objects FOR UPDATE
-- USING (
--   bucket_id = 'recipe-images' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Allow users to delete their own uploads
-- CREATE POLICY "Users can delete own uploads"
-- ON STORAGE.objects FOR DELETE
-- USING (
--   bucket_id = 'recipe-images' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- ============================================
-- 9. HELPER VIEWS (Optional)
-- ============================================

-- View for recipe statistics
CREATE OR REPLACE VIEW recipe_stats AS
SELECT 
  r.id,
  r.title,
  COUNT(DISTINCT CASE WHEN rv.vote_type = 'like' THEN rv.id END) as like_count,
  COUNT(DISTINCT CASE WHEN rv.vote_type = 'dislike' THEN rv.id END) as dislike_count
FROM recipes r
LEFT JOIN recipe_votes rv ON r.id = rv.recipe_id
GROUP BY r.id, r.title;

-- Grant access to the view
GRANT SELECT ON recipe_stats TO authenticated;
GRANT SELECT ON recipe_stats TO anon;


