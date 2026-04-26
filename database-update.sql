-- ========================================
-- DATABASE UPDATE: Add Varied Ratings & Scores
-- ========================================
-- Run this in your Supabase SQL Editor
-- ========================================

-- 1. RANDOMIZE POPULARITY SCORES (60-100 range)
UPDATE albums
SET popularity_score = FLOOR(RANDOM() * 40 + 60);

-- 2. BOOST SPECIFIC "TOP RATED" ALBUMS
-- These will appear in Top Rated section
UPDATE albums
SET popularity_score = 95
WHERE title ILIKE ANY(ARRAY[
  '%1989%',
  '%Blonde%',
  '%good kid%',
  '%To Pimp%',
  '%Scorpion%',
  '%Views%',
  '%Lover%',
  '%folklore%',
  '%evermore%',
  '%Take Care%',
  '%Nothing Was the Same%',
  '%DAMN%',
  '%Mr. Morale%'
]);

-- 3. SET DIFFERENT ALBUMS AS TRENDING (high engagement, different from top rated)
-- These will appear in Trending section
UPDATE albums
SET popularity_score = 88
WHERE title ILIKE ANY(ARRAY[
  '%Certified Lover Boy%',
  '%Her Loss%',
  '%Midnights%',
  '%Red%',
  '%Honestly Nevermind%',
  '%channel ORANGE%',
  '%Section.80%'
])
AND popularity_score != 95;

-- 4. ADD SAMPLE RATINGS to simulate user activity
-- This creates realistic rating data

-- First, let's create a few sample user IDs (you can skip this if you have real users)
-- We'll use UUIDs that won't conflict with real users

-- Insert varied ratings for TOP RATED albums (high ratings, many votes)
DO $$
DECLARE
  album_record RECORD;
  i INTEGER;
  rating_value DECIMAL;
BEGIN
  FOR album_record IN 
    SELECT id FROM albums WHERE popularity_score = 95
  LOOP
    -- Add 15-30 ratings per top album
    FOR i IN 1..(15 + FLOOR(RANDOM() * 15)) LOOP
      rating_value := 4.0 + (RANDOM() * 1.0); -- Ratings between 4.0-5.0
      INSERT INTO ratings (
        user_id, 
        album_id, 
        rating,
        created_at
      ) VALUES (
        gen_random_uuid(),
        album_record.id,
        rating_value,
        NOW() - (RANDOM() * INTERVAL '90 days')
      );
    END LOOP;
  END LOOP;
END $$;

-- Insert varied ratings for TRENDING albums (good ratings, moderate votes, recent activity)
DO $$
DECLARE
  album_record RECORD;
  i INTEGER;
  rating_value DECIMAL;
BEGIN
  FOR album_record IN 
    SELECT id FROM albums WHERE popularity_score = 88
  LOOP
    -- Add 20-40 ratings per trending album (MORE than top rated for engagement)
    FOR i IN 1..(20 + FLOOR(RANDOM() * 20)) LOOP
      rating_value := 3.5 + (RANDOM() * 1.5); -- Ratings between 3.5-5.0
      INSERT INTO ratings (
        user_id, 
        album_id, 
        rating,
        created_at
      ) VALUES (
        gen_random_uuid(),
        album_record.id,
        rating_value,
        NOW() - (RANDOM() * INTERVAL '30 days') -- More recent ratings
      );
    END LOOP;
  END LOOP;
END $$;

-- Insert some ratings for other albums (fewer votes)
DO $$
DECLARE
  album_record RECORD;
  i INTEGER;
  rating_value DECIMAL;
BEGIN
  FOR album_record IN 
    SELECT id FROM albums WHERE popularity_score NOT IN (95, 88) LIMIT 20
  LOOP
    -- Add 3-12 ratings per regular album
    FOR i IN 1..(3 + FLOOR(RANDOM() * 9)) LOOP
      rating_value := 2.5 + (RANDOM() * 2.5); -- Ratings between 2.5-5.0
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
  END LOOP;
END $$;

-- 5. VERIFY THE CHANGES
-- Run these to see what you got:

-- Check popularity score distribution
SELECT 
  CASE 
    WHEN popularity_score = 95 THEN 'Top Rated (95)'
    WHEN popularity_score = 88 THEN 'Trending (88)'
    ELSE 'Regular (' || popularity_score || ')'
  END as category,
  COUNT(*) as album_count
FROM albums
GROUP BY popularity_score
ORDER BY popularity_score DESC;

-- Check ratings distribution
SELECT 
  a.title,
  a.popularity_score,
  COUNT(r.id) as rating_count,
  ROUND(AVG(r.rating)::numeric, 2) as avg_rating
FROM albums a
LEFT JOIN ratings r ON r.album_id = a.id
GROUP BY a.id, a.title, a.popularity_score
ORDER BY rating_count DESC
LIMIT 20;
