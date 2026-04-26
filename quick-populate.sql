-- ========================================
-- QUICK POPULATE - Just the Essentials
-- ========================================
-- Use this for a faster setup with guaranteed results
-- ========================================

-- Clean slate (optional)
-- DELETE FROM ratings;

-- ========================================
-- PART 1: SET POPULARITY SCORES
-- ========================================

-- TOP RATED: Taylor Swift
UPDATE albums SET popularity_score = 96 WHERE title ILIKE '%folklore%';
UPDATE albums SET popularity_score = 96 WHERE title ILIKE '%evermore%';
UPDATE albums SET popularity_score = 96 WHERE title ILIKE '%1989%';

-- TOP RATED: Kendrick Lamar
UPDATE albums SET popularity_score = 95 WHERE title ILIKE '%To Pimp a Butterfly%';
UPDATE albums SET popularity_score = 95 WHERE title ILIKE '%good kid%' AND title ILIKE '%m.A.A.d city%';
UPDATE albums SET popularity_score = 95 WHERE title ILIKE '%DAMN%';

-- TOP RATED: Frank Ocean
UPDATE albums SET popularity_score = 97 WHERE title ILIKE '%Blonde%';
UPDATE albums SET popularity_score = 97 WHERE title ILIKE '%Channel Orange%';

-- TRENDING: Drake
UPDATE albums SET popularity_score = 88 WHERE title ILIKE '%Certified Lover Boy%';
UPDATE albums SET popularity_score = 88 WHERE title ILIKE '%Her Loss%';
UPDATE albums SET popularity_score = 88 WHERE title ILIKE '%Honestly Nevermind%';
UPDATE albums SET popularity_score = 87 WHERE title ILIKE '%Scorpion%';
UPDATE albums SET popularity_score = 87 WHERE title ILIKE '%Views%';

-- TRENDING: Taylor Swift (different albums)
UPDATE albums SET popularity_score = 89 WHERE title ILIKE '%Midnights%';
UPDATE albums SET popularity_score = 89 WHERE title ILIKE '%Red%' AND title ILIKE '%Taylor%';

-- TRENDING: Other popular artists
UPDATE albums SET popularity_score = 87 WHERE title ILIKE '%After Hours%';
UPDATE albums SET popularity_score = 87 WHERE title ILIKE '%Starboy%';
UPDATE albums SET popularity_score = 87 WHERE title ILIKE '%Astroworld%';

-- ========================================
-- PART 2: ADD RATINGS
-- ========================================

-- Helper function to add multiple ratings
CREATE OR REPLACE FUNCTION add_album_ratings(
  album_title_pattern TEXT,
  num_ratings INT,
  min_rating DECIMAL,
  max_rating DECIMAL
) RETURNS void AS $$
DECLARE
  album_id_var UUID;
  i INTEGER;
  rating_val DECIMAL;
BEGIN
  SELECT id INTO album_id_var FROM albums WHERE title ILIKE album_title_pattern LIMIT 1;
  
  IF album_id_var IS NULL THEN
    RAISE NOTICE 'Album not found: %', album_title_pattern;
    RETURN;
  END IF;
  
  FOR i IN 1..num_ratings LOOP
    rating_val := min_rating + (RANDOM() * (max_rating - min_rating));
    INSERT INTO ratings (user_id, album_id, rating, created_at)
    VALUES (
      gen_random_uuid(),
      album_id_var,
      rating_val,
      NOW() - (RANDOM() * INTERVAL '90 days')
    );
  END LOOP;
  
  RAISE NOTICE 'Added % ratings (%.1f-%.1f) for: %', num_ratings, min_rating, max_rating, album_title_pattern;
END;
$$ LANGUAGE plpgsql;

-- TOP RATED ALBUMS (high quality, moderate engagement)
-- Format: add_album_ratings('title_pattern', count, min_rating, max_rating)

SELECT add_album_ratings('%folklore%', 22, 4.5, 5.0);
SELECT add_album_ratings('%evermore%', 19, 4.4, 5.0);
SELECT add_album_ratings('%1989%', 24, 4.5, 5.0);
SELECT add_album_ratings('%Blonde%', 26, 4.6, 5.0);
SELECT add_album_ratings('%Channel Orange%', 21, 4.4, 5.0);
SELECT add_album_ratings('%To Pimp a Butterfly%', 28, 4.7, 5.0);
SELECT add_album_ratings('%good kid%', 25, 4.6, 5.0);
SELECT add_album_ratings('%DAMN%', 23, 4.5, 5.0);

-- TRENDING ALBUMS (high engagement, good but not perfect ratings)
SELECT add_album_ratings('%Certified Lover Boy%', 45, 3.8, 4.5);
SELECT add_album_ratings('%Her Loss%', 38, 3.7, 4.3);
SELECT add_album_ratings('%Honestly Nevermind%', 42, 3.5, 4.2);
SELECT add_album_ratings('%Scorpion%', 40, 3.9, 4.6);
SELECT add_album_ratings('%Views%', 37, 3.8, 4.4);
SELECT add_album_ratings('%Midnights%', 43, 4.0, 4.6);
SELECT add_album_ratings('%Red%', 35, 4.1, 4.7);
SELECT add_album_ratings('%After Hours%', 41, 4.0, 4.6);
SELECT add_album_ratings('%Starboy%', 36, 3.9, 4.5);
SELECT add_album_ratings('%Astroworld%', 44, 4.1, 4.7);

-- Clean up helper function
DROP FUNCTION add_album_ratings;

-- ========================================
-- VERIFY RESULTS
-- ========================================

-- Top Rated (should show high avg ratings, 20-28 total ratings)
SELECT 
  '🔥 TOP RATED' as section,
  a.title,
  COUNT(r.id) as total_ratings,
  ROUND(AVG(r.rating)::numeric, 2) as avg_rating
FROM albums a
LEFT JOIN ratings r ON r.album_id = a.id
WHERE a.popularity_score >= 95
GROUP BY a.id, a.title
HAVING COUNT(r.id) > 0
ORDER BY AVG(r.rating) DESC
LIMIT 10;

-- Trending (should show high total ratings, 35-45 ratings)
SELECT 
  '📈 TRENDING' as section,
  a.title,
  COUNT(r.id) as total_ratings,
  ROUND(AVG(r.rating)::numeric, 2) as avg_rating
FROM albums a
LEFT JOIN ratings r ON r.album_id = a.id
WHERE a.popularity_score BETWEEN 86 AND 90
GROUP BY a.id, a.title
HAVING COUNT(r.id) > 0
ORDER BY COUNT(r.id) DESC
LIMIT 10;

-- Summary
SELECT 
  'SUMMARY' as section,
  COUNT(DISTINCT a.id) as total_albums_with_ratings,
  COUNT(r.id) as total_ratings,
  ROUND(AVG(r.rating)::numeric, 2) as overall_avg_rating
FROM albums a
JOIN ratings r ON r.album_id = a.id;
