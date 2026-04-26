-- ========================================
-- POPULATE TOP RATED & TRENDING ALBUMS
-- ========================================
-- Run this in Supabase SQL Editor
-- This will create REAL rating data for your albums
-- ========================================

-- STEP 1: Clear existing ratings (optional - uncomment if you want fresh start)
-- DELETE FROM ratings;

-- STEP 2: Reset all popularity scores first
UPDATE albums SET popularity_score = FLOOR(RANDOM() * 30 + 50);

-- ========================================
-- TOP RATED ALBUMS (High Quality)
-- ========================================
-- These albums will have HIGH average ratings (4.5-5.0)
-- But MODERATE total ratings (15-25)

-- Taylor Swift Albums (Top Rated)
UPDATE albums SET popularity_score = 96
WHERE title ILIKE ANY(ARRAY[
  '%folklore%',
  '%evermore%',
  '%1989%',
  '%Lover%',
  '%reputation%'
]);

-- Kendrick Lamar Albums (Top Rated)
UPDATE albums SET popularity_score = 95
WHERE title ILIKE ANY(ARRAY[
  '%To Pimp a Butterfly%',
  '%good kid%',
  '%DAMN%',
  '%Mr. Morale%'
]);

-- Frank Ocean Albums (Top Rated)
UPDATE albums SET popularity_score = 97
WHERE title ILIKE ANY(ARRAY[
  '%Blonde%',
  '%Channel Orange%',
  '%channel ORANGE%'
]);

-- Other Critically Acclaimed Albums (Top Rated)
UPDATE albums SET popularity_score = 95
WHERE title ILIKE ANY(ARRAY[
  '%Kid A%',
  '%In Rainbows%',
  '%OK Computer%',
  '%The Miseducation%',
  '%Illmatic%',
  '%My Beautiful Dark Twisted Fantasy%',
  '%The Blueprint%',
  '%Purple Rain%'
]);

-- ========================================
-- TRENDING ALBUMS (High Engagement)
-- ========================================
-- These albums will have LOWER average ratings (3.8-4.3)
-- But HIGHER total ratings (30-50) = more engagement

-- Drake Albums (Trending - lots of discussion)
UPDATE albums SET popularity_score = 88
WHERE title ILIKE ANY(ARRAY[
  '%Certified Lover Boy%',
  '%Honestly Nevermind%',
  '%Her Loss%',
  '%Scorpion%',
  '%Views%',
  '%Nothing Was the Same%'
])
AND popularity_score != 95 AND popularity_score != 96 AND popularity_score != 97;

-- Taylor Swift Albums (Trending - different from top rated)
UPDATE albums SET popularity_score = 89
WHERE title ILIKE ANY(ARRAY[
  '%Midnights%',
  '%Red%',
  '%Speak Now%',
  '%Fearless%'
])
AND popularity_score != 95 AND popularity_score != 96 AND popularity_score != 97;

-- Other Popular/Discussed Albums (Trending)
UPDATE albums SET popularity_score = 87
WHERE title ILIKE ANY(ARRAY[
  '%Astroworld%',
  '%After Hours%',
  '%Starboy%',
  '%Culture%',
  '%Invasion of Privacy%',
  '%Beerbongs%',
  '%?\n%',
  '%Graduation%',
  '%808s%'
])
AND popularity_score != 95 AND popularity_score != 96 AND popularity_score != 97;

-- ========================================
-- CREATE REALISTIC RATINGS DATA
-- ========================================

-- Function to add ratings for TOP RATED albums
-- High average (4.5-5.0), moderate count (15-25)
DO $$
DECLARE
  album_record RECORD;
  i INTEGER;
  rating_value DECIMAL;
  num_ratings INTEGER;
BEGIN
  FOR album_record IN 
    SELECT id, title FROM albums WHERE popularity_score >= 95
  LOOP
    num_ratings := 15 + FLOOR(RANDOM() * 10); -- 15-25 ratings
    
    FOR i IN 1..num_ratings LOOP
      -- 80% chance of 4.5-5.0 rating, 20% chance of 4.0-4.5
      IF RANDOM() < 0.8 THEN
        rating_value := 4.5 + (RANDOM() * 0.5); -- 4.5-5.0
      ELSE
        rating_value := 4.0 + (RANDOM() * 0.5); -- 4.0-4.5
      END IF;
      
      INSERT INTO ratings (
        user_id, 
        album_id, 
        rating,
        created_at
      ) VALUES (
        gen_random_uuid(),
        album_record.id,
        rating_value,
        NOW() - (RANDOM() * INTERVAL '180 days')
      );
    END LOOP;
    
    RAISE NOTICE 'Added % ratings for TOP RATED: %', num_ratings, album_record.title;
  END LOOP;
END $$;

-- Function to add ratings for TRENDING albums
-- Moderate average (3.8-4.3), HIGH count (30-50)
DO $$
DECLARE
  album_record RECORD;
  i INTEGER;
  rating_value DECIMAL;
  num_ratings INTEGER;
BEGIN
  FOR album_record IN 
    SELECT id, title FROM albums WHERE popularity_score BETWEEN 86 AND 90
  LOOP
    num_ratings := 30 + FLOOR(RANDOM() * 20); -- 30-50 ratings (HIGH ENGAGEMENT)
    
    FOR i IN 1..num_ratings LOOP
      -- More varied ratings (3.5-5.0 with bell curve around 4.0)
      IF RANDOM() < 0.4 THEN
        rating_value := 4.0 + (RANDOM() * 0.5); -- 4.0-4.5 (40% chance)
      ELSIF RANDOM() < 0.7 THEN
        rating_value := 3.5 + (RANDOM() * 0.5); -- 3.5-4.0 (30% chance)
      ELSE
        rating_value := 4.5 + (RANDOM() * 0.5); -- 4.5-5.0 (30% chance)
      END IF;
      
      INSERT INTO ratings (
        user_id, 
        album_id, 
        rating,
        created_at
      ) VALUES (
        gen_random_uuid(),
        album_record.id,
        rating_value,
        NOW() - (RANDOM() * INTERVAL '60 days') -- More recent
      );
    END LOOP;
    
    RAISE NOTICE 'Added % ratings for TRENDING: %', num_ratings, album_record.title;
  END LOOP;
END $$;

-- Add some ratings for other albums (lower priority)
DO $$
DECLARE
  album_record RECORD;
  i INTEGER;
  rating_value DECIMAL;
  num_ratings INTEGER;
BEGIN
  FOR album_record IN 
    SELECT id, title FROM albums 
    WHERE popularity_score < 86
    LIMIT 30
  LOOP
    num_ratings := 3 + FLOOR(RANDOM() * 8); -- 3-10 ratings
    
    FOR i IN 1..num_ratings LOOP
      rating_value := 2.5 + (RANDOM() * 2.5); -- 2.5-5.0 (varied)
      
      INSERT INTO ratings (
        user_id, 
        album_id, 
        rating,
        created_at
      ) VALUES (
        gen_random_uuid(),
        album_record.id,
        rating_value,
        NOW() - (RANDOM() * INTERVAL '365 days')
      );
    END LOOP;
  END LOOP;
END $$;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check TOP RATED albums (should have high avg rating, moderate count)
SELECT 
  a.title,
  a.artists->>'name' as artist,
  a.year,
  COUNT(r.id) as total_ratings,
  ROUND(AVG(r.rating)::numeric, 2) as avg_rating
FROM albums a
LEFT JOIN ratings r ON r.album_id = a.id
WHERE a.popularity_score >= 95
GROUP BY a.id, a.title, a.artists, a.year
ORDER BY AVG(r.rating) DESC
LIMIT 20;

-- Check TRENDING albums (should have high count, moderate avg rating)
SELECT 
  a.title,
  a.artists->>'name' as artist,
  a.year,
  COUNT(r.id) as total_ratings,
  ROUND(AVG(r.rating)::numeric, 2) as avg_rating
FROM albums a
LEFT JOIN ratings r ON r.album_id = a.id
WHERE a.popularity_score BETWEEN 86 AND 90
GROUP BY a.id, a.title, a.artists, a.year
ORDER BY COUNT(r.id) DESC
LIMIT 20;

-- Overall statistics
SELECT 
  CASE 
    WHEN popularity_score >= 95 THEN '🔥 TOP RATED (95+)'
    WHEN popularity_score BETWEEN 86 AND 90 THEN '📈 TRENDING (86-90)'
    ELSE '📀 REGULAR (<86)'
  END as category,
  COUNT(DISTINCT a.id) as album_count,
  ROUND(AVG(rating_stats.avg_rating)::numeric, 2) as avg_rating,
  ROUND(AVG(rating_stats.total_ratings)::numeric, 0) as avg_total_ratings
FROM albums a
LEFT JOIN (
  SELECT 
    album_id,
    AVG(rating) as avg_rating,
    COUNT(id) as total_ratings
  FROM ratings
  GROUP BY album_id
) rating_stats ON rating_stats.album_id = a.id
GROUP BY 
  CASE 
    WHEN popularity_score >= 95 THEN '🔥 TOP RATED (95+)'
    WHEN popularity_score BETWEEN 86 AND 90 THEN '📈 TRENDING (86-90)'
    ELSE '📀 REGULAR (<86)'
  END
ORDER BY MIN(popularity_score) DESC;
