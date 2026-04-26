-- ========================================
-- TEST QUERY: Check what albums you have
-- ========================================
-- Run this FIRST to see what's in your database
-- ========================================

-- 1. Check if you have the expected albums
SELECT 
  'Albums Found' as status,
  title,
  year,
  id
FROM albums
WHERE 
  title ILIKE ANY(ARRAY[
    '%folklore%',
    '%1989%',
    '%Blonde%',
    '%To Pimp%',
    '%DAMN%',
    '%Certified Lover Boy%',
    '%Scorpion%',
    '%Midnights%',
    '%Her Loss%',
    '%Astroworld%'
  ])
ORDER BY title;

-- 2. Count total albums
SELECT 
  'Total Albums' as metric,
  COUNT(*) as count
FROM albums;

-- 3. Check if any ratings exist
SELECT 
  'Total Ratings' as metric,
  COUNT(*) as count
FROM ratings;

-- 4. Show artists you have
SELECT DISTINCT
  artists->>'name' as artist_name
FROM albums
WHERE artists IS NOT NULL
ORDER BY artist_name
LIMIT 30;

-- 5. Sample of your albums
SELECT 
  title,
  artists->>'name' as artist,
  year
FROM albums
ORDER BY RANDOM()
LIMIT 20;
