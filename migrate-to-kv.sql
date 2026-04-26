-- =====================================================
-- MIGRATION: SQL Tables to Key-Value Storage
-- =====================================================
-- This script migrates from relational tables to a 
-- key-value storage model using JSONB in Supabase
-- =====================================================

-- Step 1: Create Key-Value Store Table
-- =====================================================

CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_kv_store_key_pattern ON kv_store(key text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_kv_store_value_gin ON kv_store USING gin(value);

-- Enable RLS
ALTER TABLE kv_store ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kv_store
-- Public read for albums, artists, profiles
CREATE POLICY "Public can read public data"
  ON kv_store FOR SELECT
  USING (
    key LIKE 'album:%' OR 
    key LIKE 'artist:%' OR 
    key LIKE 'profile:%' OR
    key LIKE 'index:%' OR
    key LIKE 'rating:%' OR
    key LIKE 'review:%'
  );

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON kv_store FOR SELECT
  USING (
    key LIKE 'user_data:' || auth.uid()::text || ':%'
  );

-- Users can insert/update their own data
CREATE POLICY "Users can write own data"
  ON kv_store FOR INSERT
  WITH CHECK (
    key LIKE 'rating:' || auth.uid()::text || ':%' OR
    key LIKE 'review:' || auth.uid()::text || ':%' OR
    key LIKE 'collection:' || auth.uid()::text || ':%' OR
    key LIKE 'profile:' || auth.uid()::text
  );

CREATE POLICY "Users can update own data"
  ON kv_store FOR UPDATE
  USING (
    key LIKE 'rating:' || auth.uid()::text || ':%' OR
    key LIKE 'review:' || auth.uid()::text || ':%' OR
    key LIKE 'collection:' || auth.uid()::text || ':%' OR
    key LIKE 'profile:' || auth.uid()::text
  );

CREATE POLICY "Users can delete own data"
  ON kv_store FOR DELETE
  USING (
    key LIKE 'rating:' || auth.uid()::text || ':%' OR
    key LIKE 'review:' || auth.uid()::text || ':%' OR
    key LIKE 'collection:' || auth.uid()::text || ':%'
  );

-- Step 2: Migrate Albums to Key-Value
-- =====================================================

-- Insert each album as album:{id}
INSERT INTO kv_store (key, value)
SELECT 
  'album:' || id,
  jsonb_build_object(
    'id', id,
    'title', title,
    'artist_id', artist_id,
    'year', year,
    'cover_url', cover_url,
    'description', description,
    'tracks', to_jsonb(tracks),
    'genre', genre,
    'genres', to_jsonb(genres),
    'popularity_score', popularity_score,
    'is_featured', is_featured,
    'created_at', created_at,
    'updated_at', updated_at
  )
FROM albums
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Create index of all album IDs
INSERT INTO kv_store (key, value)
SELECT 
  'index:albums',
  jsonb_build_object(
    'ids', jsonb_agg(id ORDER BY popularity_score DESC),
    'total', COUNT(*)
  )
FROM albums
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Create featured albums index
INSERT INTO kv_store (key, value)
SELECT 
  'index:albums:featured',
  jsonb_build_object(
    'ids', jsonb_agg(id ORDER BY popularity_score DESC),
    'total', COUNT(*)
  )
FROM albums
WHERE is_featured = true
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Create top rated albums index
INSERT INTO kv_store (key, value)
SELECT 
  'index:albums:top_rated',
  jsonb_build_object(
    'ids', jsonb_agg(id ORDER BY popularity_score DESC),
    'total', COUNT(*)
  )
FROM albums
WHERE popularity_score >= 95
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Step 3: Migrate Artists to Key-Value
-- =====================================================

-- Insert each artist as artist:{id}
INSERT INTO kv_store (key, value)
SELECT 
  'artist:' || id,
  jsonb_build_object(
    'id', id,
    'name', name,
    'genre', genre,
    'bio', bio,
    'image_url', image_url,
    'formed_year', formed_year,
    'country', country,
    'created_at', created_at
  )
FROM artists
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Create index of all artist IDs
INSERT INTO kv_store (key, value)
SELECT 
  'index:artists',
  jsonb_build_object(
    'ids', jsonb_agg(id ORDER BY name),
    'total', COUNT(*)
  )
FROM artists
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Create artist albums index
INSERT INTO kv_store (key, value)
SELECT 
  'index:artist_albums:' || artist_id,
  jsonb_build_object(
    'artist_id', artist_id,
    'album_ids', jsonb_agg(id ORDER BY year DESC),
    'total', COUNT(*)
  )
FROM albums
GROUP BY artist_id
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Step 4: Migrate Profiles to Key-Value
-- =====================================================

-- Insert each profile as profile:{id}
INSERT INTO kv_store (key, value)
SELECT 
  'profile:' || id,
  jsonb_build_object(
    'id', id,
    'username', username,
    'display_name', display_name,
    'bio', bio,
    'avatar_url', avatar_url,
    'created_at', created_at,
    'updated_at', updated_at
  )
FROM profiles
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Step 5: Migrate Ratings to Key-Value
-- =====================================================

-- Insert each rating as rating:{user_id}:{album_id}
INSERT INTO kv_store (key, value)
SELECT 
  'rating:' || user_id || ':' || album_id,
  jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'album_id', album_id,
    'rating', rating,
    'created_at', created_at,
    'updated_at', updated_at
  )
FROM ratings
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Create index of ratings by album
INSERT INTO kv_store (key, value)
SELECT 
  'index:album_ratings:' || album_id,
  jsonb_build_object(
    'album_id', album_id,
    'ratings', jsonb_agg(
      jsonb_build_object(
        'user_id', user_id,
        'rating', rating,
        'created_at', created_at
      ) ORDER BY created_at DESC
    ),
    'average_rating', AVG(rating),
    'total_ratings', COUNT(*)
  )
FROM ratings
GROUP BY album_id
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Step 6: Migrate Reviews to Key-Value
-- =====================================================

-- Insert each review as review:{user_id}:{album_id}
INSERT INTO kv_store (key, value)
SELECT 
  'review:' || r.user_id || ':' || r.album_id,
  jsonb_build_object(
    'id', r.id,
    'user_id', r.user_id,
    'album_id', r.album_id,
    'text', r.text,
    'created_at', r.created_at,
    'updated_at', r.updated_at,
    'profile', jsonb_build_object(
      'username', p.username,
      'avatar_url', p.avatar_url
    )
  )
FROM reviews r
JOIN profiles p ON r.user_id = p.id
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Create index of reviews by album
INSERT INTO kv_store (key, value)
SELECT 
  'index:album_reviews:' || r.album_id,
  jsonb_build_object(
    'album_id', r.album_id,
    'reviews', jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'user_id', r.user_id,
        'text', r.text,
        'created_at', r.created_at,
        'profile', jsonb_build_object(
          'username', p.username,
          'avatar_url', p.avatar_url
        )
      ) ORDER BY r.created_at DESC
    ),
    'total_reviews', COUNT(*)
  )
FROM reviews r
JOIN profiles p ON r.user_id = p.id
GROUP BY r.album_id
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Step 7: Migrate Collections to Key-Value
-- =====================================================

-- Insert each collection item as collection:{user_id}:{album_id}
INSERT INTO kv_store (key, value)
SELECT 
  'collection:' || user_id || ':' || album_id,
  jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'album_id', album_id,
    'status', status,
    'added_at', added_at
  )
FROM collections
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Create index of collections by user
INSERT INTO kv_store (key, value)
SELECT 
  'index:user_collections:' || user_id,
  jsonb_build_object(
    'user_id', user_id,
    'items', jsonb_agg(
      jsonb_build_object(
        'album_id', album_id,
        'status', status,
        'added_at', added_at
      ) ORDER BY added_at DESC
    ),
    'total', COUNT(*)
  )
FROM collections
GROUP BY user_id
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count records in KV store
SELECT 
  CASE 
    WHEN key LIKE 'album:%' THEN 'albums'
    WHEN key LIKE 'artist:%' THEN 'artists'
    WHEN key LIKE 'profile:%' THEN 'profiles'
    WHEN key LIKE 'rating:%' THEN 'ratings'
    WHEN key LIKE 'review:%' THEN 'reviews'
    WHEN key LIKE 'collection:%' THEN 'collections'
    WHEN key LIKE 'index:%' THEN 'indexes'
    ELSE 'other'
  END as type,
  COUNT(*) as count
FROM kv_store
GROUP BY type
ORDER BY type;

-- Sample album from KV
SELECT * FROM kv_store WHERE key LIKE 'album:%' LIMIT 1;

-- Sample index
SELECT * FROM kv_store WHERE key = 'index:albums';

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get album with artist info
CREATE OR REPLACE FUNCTION get_album_with_artist(album_id TEXT)
RETURNS JSONB AS $$
DECLARE
  album_data JSONB;
  artist_data JSONB;
  result JSONB;
BEGIN
  -- Get album
  SELECT value INTO album_data
  FROM kv_store
  WHERE key = 'album:' || album_id;
  
  IF album_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get artist
  SELECT value INTO artist_data
  FROM kv_store
  WHERE key = 'artist:' || (album_data->>'artist_id');
  
  -- Combine
  result := album_data || jsonb_build_object(
    'artists', jsonb_build_object(
      'id', artist_data->>'id',
      'name', artist_data->>'name',
      'genre', artist_data->>'genre'
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get album with ratings
CREATE OR REPLACE FUNCTION get_album_with_ratings(album_id TEXT)
RETURNS JSONB AS $$
DECLARE
  album_data JSONB;
  ratings_data JSONB;
  result JSONB;
BEGIN
  -- Get album with artist
  album_data := get_album_with_artist(album_id);
  
  IF album_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get ratings index
  SELECT value INTO ratings_data
  FROM kv_store
  WHERE key = 'index:album_ratings:' || album_id;
  
  -- Combine with ratings stats
  result := album_data || jsonb_build_object(
    'averageRating', COALESCE((ratings_data->>'average_rating')::numeric, 0),
    'totalRatings', COALESCE((ratings_data->>'total_ratings')::integer, 0)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to search albums
CREATE OR REPLACE FUNCTION search_albums(search_query TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(value)
  INTO result
  FROM kv_store
  WHERE key LIKE 'album:%'
    AND value->>'title' ILIKE '%' || search_query || '%'
  LIMIT 10;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration to Key-Value Storage Complete!';
  RAISE NOTICE 'Key patterns:';
  RAISE NOTICE '  - album:{id}';
  RAISE NOTICE '  - artist:{id}';
  RAISE NOTICE '  - profile:{id}';
  RAISE NOTICE '  - rating:{user_id}:{album_id}';
  RAISE NOTICE '  - review:{user_id}:{album_id}';
  RAISE NOTICE '  - collection:{user_id}:{album_id}';
  RAISE NOTICE '  - index:albums';
  RAISE NOTICE '  - index:artists';
  RAISE NOTICE '  - index:album_ratings:{album_id}';
  RAISE NOTICE '  - index:album_reviews:{album_id}';
END $$;
