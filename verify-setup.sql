-- ========================================
-- VERIFY YOUR SETUP
-- ========================================
-- Run this to confirm everything is set up correctly
-- ========================================

-- 1. Check Top Rated Albums (should have popularity_score >= 95)
SELECT 
  '🔥 TOP RATED' as section,
  title,
  popularity_score,
  is_featured,
  year
FROM albums
WHERE popularity_score >= 95
ORDER BY popularity_score DESC, created_at DESC
LIMIT 10;

-- 2. Check Trending Albums (should have is_featured = true)
SELECT 
  '📈 TRENDING' as section,
  title,
  popularity_score,
  is_featured,
  year
FROM albums
WHERE is_featured = true
ORDER BY popularity_score DESC, created_at DESC
LIMIT 10;

-- 3. Quick summary
SELECT 
  CASE 
    WHEN popularity_score >= 95 THEN '🔥 Top Rated'
    WHEN is_featured = true THEN '📈 Trending'
    ELSE '📀 Other'
  END as category,
  COUNT(*) as count
FROM albums
GROUP BY 
  CASE 
    WHEN popularity_score >= 95 THEN '🔥 Top Rated'
    WHEN is_featured = true THEN '📈 Trending'
    ELSE '📀 Other'
  END
ORDER BY count DESC;

-- 4. Check if any albums are in BOTH categories (should be empty or minimal)
SELECT 
  'Albums in BOTH categories' as warning,
  title,
  popularity_score,
  is_featured
FROM albums
WHERE popularity_score >= 95 AND is_featured = true;
