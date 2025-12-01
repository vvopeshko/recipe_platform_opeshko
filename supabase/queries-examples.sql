-- Example Queries for Recipe Platform
-- Useful for testing and understanding the schema

-- ============================================
-- 1. GET ALL RECIPES WITH RELATED DATA
-- ============================================
SELECT 
  r.*,
  json_build_object(
    'username', p.username,
    'avatar_url', p.avatar_url
  ) as profiles,
  json_build_object(
    'name', c.name,
    'slug', c.slug
  ) as categories,
  (
    SELECT COUNT(*) 
    FROM recipe_votes rv 
    WHERE rv.recipe_id = r.id AND rv.vote_type = 'like'
  ) as like_count,
  (
    SELECT COUNT(*) 
    FROM recipe_votes rv 
    WHERE rv.recipe_id = r.id AND rv.vote_type = 'dislike'
  ) as dislike_count
FROM recipes r
LEFT JOIN profiles p ON r.user_id = p.id
LEFT JOIN categories c ON r.category_id = c.id
ORDER BY r.created_at DESC;

-- ============================================
-- 2. GET SINGLE RECIPE WITH INGREDIENTS AND STEPS
-- ============================================
SELECT 
  r.*,
  json_build_object(
    'username', p.username,
    'avatar_url', p.avatar_url
  ) as profiles,
  json_build_object(
    'name', c.name,
    'slug', c.slug
  ) as categories,
  COALESCE(
    json_agg(
      json_build_object(
        'id', i.id,
        'item', i.item,
        'quantity', i.quantity,
        'unit', i.unit,
        'order_index', i.order_index
      ) ORDER BY i.order_index
    ) FILTER (WHERE i.id IS NOT NULL),
    '[]'::json
  ) as ingredients,
  COALESCE(
    json_agg(
      json_build_object(
        'id', s.id,
        'step_number', s.step_number,
        'instruction', s.instruction
      ) ORDER BY s.step_number
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::json
  ) as steps
FROM recipes r
LEFT JOIN profiles p ON r.user_id = p.id
LEFT JOIN categories c ON r.category_id = c.id
LEFT JOIN ingredients i ON r.id = i.recipe_id
LEFT JOIN steps s ON r.id = s.recipe_id
WHERE r.id = 'YOUR_RECIPE_ID_HERE'
GROUP BY r.id, p.username, p.avatar_url, c.name, c.slug;

-- ============================================
-- 3. SEARCH RECIPES BY TITLE OR DESCRIPTION
-- ============================================
SELECT 
  r.*,
  p.username,
  c.name as category_name
FROM recipes r
LEFT JOIN profiles p ON r.user_id = p.id
LEFT JOIN categories c ON r.category_id = c.id
WHERE 
  r.title ILIKE '%search_term%' OR
  r.description ILIKE '%search_term%' OR
  EXISTS (
    SELECT 1 FROM ingredients i
    WHERE i.recipe_id = r.id
    AND i.item ILIKE '%search_term%'
  )
ORDER BY r.created_at DESC;

-- ============================================
-- 4. FILTER RECIPES BY CATEGORY
-- ============================================
SELECT 
  r.*,
  p.username,
  c.name as category_name
FROM recipes r
LEFT JOIN profiles p ON r.user_id = p.id
LEFT JOIN categories c ON r.category_id = c.id
WHERE c.slug = 'breakfast' -- or any category slug
ORDER BY r.created_at DESC;

-- ============================================
-- 5. GET USER'S RECIPES
-- ============================================
SELECT 
  r.*,
  c.name as category_name
FROM recipes r
LEFT JOIN categories c ON r.category_id = c.id
WHERE r.user_id = auth.uid()
ORDER BY r.created_at DESC;

-- ============================================
-- 6. GET USER'S VOTE ON A RECIPE
-- ============================================
SELECT vote_type
FROM recipe_votes
WHERE recipe_id = 'YOUR_RECIPE_ID_HERE'
AND user_id = auth.uid()
LIMIT 1;

-- ============================================
-- 7. UPSERT VOTE (LIKE/DISLIKE)
-- ============================================
INSERT INTO recipe_votes (recipe_id, user_id, vote_type)
VALUES ('YOUR_RECIPE_ID_HERE', auth.uid(), 'like')
ON CONFLICT (recipe_id, user_id)
DO UPDATE SET 
  vote_type = EXCLUDED.vote_type,
  updated_at = NOW();

-- ============================================
-- 8. DELETE VOTE
-- ============================================
DELETE FROM recipe_votes
WHERE recipe_id = 'YOUR_RECIPE_ID_HERE'
AND user_id = auth.uid();

-- ============================================
-- 9. GET RECIPE WITH VOTE COUNTS
-- ============================================
SELECT 
  r.*,
  COUNT(CASE WHEN rv.vote_type = 'like' THEN 1 END) as like_count,
  COUNT(CASE WHEN rv.vote_type = 'dislike' THEN 1 END) as dislike_count,
  (
    SELECT vote_type 
    FROM recipe_votes 
    WHERE recipe_id = r.id 
    AND user_id = auth.uid()
    LIMIT 1
  ) as user_vote
FROM recipes r
LEFT JOIN recipe_votes rv ON r.id = rv.recipe_id
WHERE r.id = 'YOUR_RECIPE_ID_HERE'
GROUP BY r.id;

-- ============================================
-- 10. GET TOP RECIPES BY LIKES
-- ============================================
SELECT 
  r.*,
  p.username,
  c.name as category_name,
  COUNT(CASE WHEN rv.vote_type = 'like' THEN 1 END) as like_count
FROM recipes r
LEFT JOIN profiles p ON r.user_id = p.id
LEFT JOIN categories c ON r.category_id = c.id
LEFT JOIN recipe_votes rv ON r.id = rv.recipe_id
GROUP BY r.id, p.username, c.name
ORDER BY like_count DESC
LIMIT 20;

-- ============================================
-- 11. CREATE A COMPLETE RECIPE
-- ============================================
-- Step 1: Insert recipe
INSERT INTO recipes (
  user_id, title, description, image_url, category_id,
  prep_time, cook_time, servings, difficulty
)
VALUES (
  auth.uid(),
  'Recipe Title',
  'Recipe Description',
  'https://example.com/image.jpg',
  (SELECT id FROM categories WHERE slug = 'dinner'),
  30, -- prep_time
  45, -- cook_time
  4,  -- servings
  'Medium' -- difficulty
)
RETURNING id;

-- Step 2: Insert ingredients (use recipe_id from above)
INSERT INTO ingredients (recipe_id, item, quantity, unit, order_index)
VALUES
  ('RECIPE_ID_FROM_ABOVE', 'Flour', '2', 'cups', 0),
  ('RECIPE_ID_FROM_ABOVE', 'Sugar', '1', 'cup', 1);

-- Step 3: Insert steps (use recipe_id from above)
INSERT INTO steps (recipe_id, step_number, instruction)
VALUES
  ('RECIPE_ID_FROM_ABOVE', 1, 'Preheat oven'),
  ('RECIPE_ID_FROM_ABOVE', 2, 'Mix ingredients');

-- ============================================
-- 12. UPDATE RECIPE (OWNER ONLY)
-- ============================================
UPDATE recipes
SET 
  title = 'Updated Title',
  description = 'Updated Description',
  updated_at = NOW()
WHERE id = 'YOUR_RECIPE_ID_HERE'
AND user_id = auth.uid()
RETURNING *;

-- ============================================
-- 13. DELETE RECIPE (CASCADES TO INGREDIENTS, STEPS, VOTES)
-- ============================================
DELETE FROM recipes
WHERE id = 'YOUR_RECIPE_ID_HERE'
AND user_id = auth.uid();

-- ============================================
-- 14. GET ALL CATEGORIES
-- ============================================
SELECT * FROM categories
ORDER BY name ASC;

-- ============================================
-- 15. CREATE USER PROFILE (AFTER AUTH)
-- ============================================
INSERT INTO profiles (id, username)
VALUES (auth.uid(), 'username')
ON CONFLICT (id) DO UPDATE
SET username = EXCLUDED.username;


