# 🔄 KEY-VALUE STORAGE MIGRATION GUIDE

Complete guide to migrating from SQL tables to Key-Value storage in Supabase

---

## 📋 OVERVIEW

**What Changed:**
- ❌ **Before**: Multiple relational SQL tables (albums, artists, profiles, ratings, reviews, collections)
- ✅ **After**: Single `kv_store` table with JSONB values and structured keys

**Why Key-Value?**
- 🚀 **Flexible Schema** - Easy to add new fields without migrations
- 📦 **Denormalized Data** - Faster reads (no joins needed)
- 🎯 **Simplified Queries** - Direct key lookups
- 💾 **JSONB Power** - Rich querying with PostgreSQL JSONB operators
- 🔒 **Same Security** - Row Level Security (RLS) still enforced

---

## 🗃️ KEY STRUCTURE

### Key Patterns

| Pattern | Example | Description |
|---------|---------|-------------|
| `album:{id}` | `album:abc-123...` | Individual album data |
| `artist:{id}` | `artist:xyz-789...` | Individual artist data |
| `profile:{id}` | `profile:user-456...` | User profile data |
| `rating:{user_id}:{album_id}` | `rating:user-123:album-456` | User's rating for an album |
| `review:{user_id}:{album_id}` | `review:user-123:album-456` | User's review for an album |
| `collection:{user_id}:{album_id}` | `collection:user-123:album-456` | Collection entry |
| `index:albums` | `index:albums` | List of all album IDs |
| `index:albums:featured` | `index:albums:featured` | Featured album IDs |
| `index:albums:top_rated` | `index:albums:top_rated` | Top rated album IDs |
| `index:artists` | `index:artists` | List of all artist IDs |
| `index:artist_albums:{id}` | `index:artist_albums:xyz-789` | Albums by an artist |
| `index:album_ratings:{id}` | `index:album_ratings:abc-123` | Ratings for an album |
| `index:album_reviews:{id}` | `index:album_reviews:abc-123` | Reviews for an album |

---

## 📊 DATA STRUCTURE

### kv_store Table Schema

```sql
CREATE TABLE kv_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Example: Album Entry

**Key:** `album:abc-123-def-456`

**Value:**
```json
{
  "id": "abc-123-def-456",
  "title": "folklore",
  "artist_id": "xyz-789-abc-012",
  "year": 2020,
  "cover_url": "https://images.unsplash.com/...",
  "description": "Taylor Swift's eighth studio album...",
  "tracks": ["the 1", "cardigan", "the last great american dynasty", ...],
  "genre": "Indie Folk",
  "genres": ["Indie Folk", "Alternative", "Pop"],
  "popularity_score": 96,
  "is_featured": false,
  "created_at": "2026-04-08T10:00:00Z",
  "updated_at": "2026-04-08T10:00:00Z"
}
```

### Example: Ratings Index

**Key:** `index:album_ratings:abc-123-def-456`

**Value:**
```json
{
  "album_id": "abc-123-def-456",
  "ratings": [
    {
      "user_id": "user-123",
      "rating": 4.5,
      "created_at": "2026-04-08T10:00:00Z"
    },
    {
      "user_id": "user-456",
      "rating": 5.0,
      "created_at": "2026-04-07T15:30:00Z"
    }
  ],
  "average_rating": 4.75,
  "total_ratings": 2
}
```

### Example: Albums Index

**Key:** `index:albums`

**Value:**
```json
{
  "ids": [
    "abc-123-def-456",
    "xyz-789-abc-012",
    "def-456-ghi-789",
    ...
  ],
  "total": 100
}
```

---

## 🚀 MIGRATION STEPS

### Step 1: Run the Migration SQL

Execute the migration script in Supabase SQL Editor:

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Create new query
# 3. Paste contents of migrate-to-kv.sql
# 4. Click "Run"
```

**What it does:**
1. ✅ Creates `kv_store` table
2. ✅ Sets up RLS policies
3. ✅ Migrates all albums → `album:{id}` keys
4. ✅ Migrates all artists → `artist:{id}` keys
5. ✅ Migrates all profiles → `profile:{id}` keys
6. ✅ Migrates all ratings → `rating:{user_id}:{album_id}` keys
7. ✅ Migrates all reviews → `review:{user_id}:{album_id}` keys
8. ✅ Migrates all collections → `collection:{user_id}:{album_id}` keys
9. ✅ Creates all indexes
10. ✅ Creates helper functions

### Step 2: Verify Migration

Run verification queries:

```sql
-- Count records by type
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
```

Expected output:
```
type         | count
-------------+-------
albums       | 100+
artists      | 30+
indexes      | 10+
profiles     | (varies)
ratings      | (varies)
reviews      | (varies)
```

### Step 3: UI Already Updated!

The UI has been automatically updated to use the new KV storage:
- ✅ `/src/app/lib/api.ts` now imports from `/src/app/lib/api-kv.ts`
- ✅ All pages (Home, AlbumDetail, ArtistPage, etc.) work unchanged
- ✅ All components continue to work as before

---

## 🔍 QUERYING DATA

### Basic Operations

#### Get Single Value
```typescript
// Get an album
const album = await kvGet('album:abc-123-def-456');
```

#### Get Multiple Values
```typescript
// Get multiple albums
const albumKeys = ['album:abc-123', 'album:xyz-789'];
const albums = await kvGetMany(albumKeys);
// Returns: { 'album:abc-123': {...}, 'album:xyz-789': {...} }
```

#### Set Value
```typescript
// Save an album
await kvSet('album:abc-123', {
  id: 'abc-123',
  title: 'New Album',
  // ... other fields
});
```

#### Query by Pattern
```typescript
// Get all ratings for an album
const ratings = await kvQuery('rating:%:album-123');
```

### SQL Queries

#### Get Album with Artist Info
```sql
-- Using helper function
SELECT get_album_with_artist('abc-123-def-456');
```

#### Get Album with Ratings
```sql
-- Using helper function
SELECT get_album_with_ratings('abc-123-def-456');
```

#### Search Albums
```sql
-- Using helper function
SELECT search_albums('folklore');
```

#### Direct JSONB Query
```sql
-- Find albums by year
SELECT value
FROM kv_store
WHERE key LIKE 'album:%'
  AND (value->>'year')::integer = 2020;
```

#### Search in JSONB
```sql
-- Search album titles
SELECT value
FROM kv_store
WHERE key LIKE 'album:%'
  AND value->>'title' ILIKE '%folklore%';
```

---

## 🔐 SECURITY (RLS)

### Policies Applied

**Public Read:**
```sql
-- Anyone can read albums, artists, profiles, ratings, reviews
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
```

**User Write:**
```sql
-- Users can only write their own data
CREATE POLICY "Users can write own data"
  ON kv_store FOR INSERT
  WITH CHECK (
    key LIKE 'rating:' || auth.uid()::text || ':%' OR
    key LIKE 'review:' || auth.uid()::text || ':%' OR
    key LIKE 'collection:' || auth.uid()::text || ':%' OR
    key LIKE 'profile:' || auth.uid()::text
  );
```

### Testing RLS

```sql
-- Test as anonymous user (should work)
SELECT value FROM kv_store WHERE key = 'album:abc-123';

-- Test as logged in user (should only see own ratings)
SELECT value FROM kv_store WHERE key LIKE 'rating:' || auth.uid()::text || ':%';
```

---

## 📈 PERFORMANCE

### Indexes

```sql
-- Pattern matching index (for key LIKE queries)
CREATE INDEX idx_kv_store_key_pattern ON kv_store(key text_pattern_ops);

-- JSONB GIN index (for value queries)
CREATE INDEX idx_kv_store_value_gin ON kv_store USING gin(value);
```

### Query Optimization

**Fast:**
```sql
-- Direct key lookup (uses primary key)
SELECT value FROM kv_store WHERE key = 'album:abc-123';
```

**Fast:**
```sql
-- Pattern matching (uses idx_kv_store_key_pattern)
SELECT value FROM kv_store WHERE key LIKE 'album:%';
```

**Fast:**
```sql
-- JSONB field lookup (uses idx_kv_store_value_gin)
SELECT value FROM kv_store WHERE value->>'title' = 'folklore';
```

**Slow:**
```sql
-- ILIKE on JSONB (full scan)
SELECT value FROM kv_store WHERE value->>'title' ILIKE '%folk%';
-- Use sparingly, add more specific indexes if needed
```

---

## 🔄 DATA MAINTENANCE

### Update an Album
```typescript
// Get existing album
const album = await kvGet('album:abc-123');

// Update fields
const updated = {
  ...album,
  title: 'Updated Title',
  updated_at: new Date().toISOString(),
};

// Save
await kvSet('album:abc-123', updated);
```

### Add New Album
```typescript
// Create new album
await kvSet('album:new-id-123', {
  id: 'new-id-123',
  title: 'New Album',
  artist_id: 'artist-456',
  year: 2026,
  // ... other fields
});

// Update albums index
const index = await kvGet('index:albums');
await kvSet('index:albums', {
  ids: [...index.ids, 'new-id-123'],
  total: index.total + 1,
});
```

### Rebuild Ratings Index
```sql
-- This is done automatically when ratings are added/updated
-- But can be done manually:

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
FROM (
  SELECT 
    (value->>'album_id') as album_id,
    (value->>'user_id') as user_id,
    (value->>'rating')::numeric as rating,
    value->>'created_at' as created_at
  FROM kv_store
  WHERE key LIKE 'rating:%'
) ratings_data
GROUP BY album_id
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();
```

---

## 🆚 COMPARISON: SQL vs KV

### Get Album with Artist (Before)
```typescript
// SQL: Required JOIN
const { data } = await supabase
  .from('albums')
  .select(`
    *,
    artists (
      id,
      name,
      genre
    )
  `)
  .eq('id', id)
  .single();
```

### Get Album with Artist (After)
```typescript
// KV: Two simple key lookups
const album = await kvGet(`album:${id}`);
const artist = await kvGet(`artist:${album.artist_id}`);

const result = {
  ...album,
  artists: {
    id: artist.id,
    name: artist.name,
    genre: artist.genre,
  },
};
```

### Get Ratings for Album (Before)
```typescript
// SQL: Query and aggregate
const { data } = await supabase
  .from('ratings')
  .select('rating')
  .eq('album_id', albumId);

const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
```

### Get Ratings for Album (After)
```typescript
// KV: One key lookup (pre-aggregated!)
const ratingsIndex = await kvGet(`index:album_ratings:${albumId}`);

const avg = ratingsIndex.average_rating;
const total = ratingsIndex.total_ratings;
```

---

## ✅ BENEFITS

### Performance
- ✅ **Faster Reads** - No JOINs needed
- ✅ **Pre-Aggregated Stats** - Ratings/reviews already calculated
- ✅ **Direct Key Lookups** - O(1) access by key
- ✅ **Flexible Indexes** - Can index any JSONB field

### Development
- ✅ **No Schema Migrations** - Just update JSONB structure
- ✅ **Flexible Data** - Easy to add new fields
- ✅ **Simple API** - kvGet, kvSet, kvQuery
- ✅ **Type Safe** - Still use TypeScript interfaces

### Scalability
- ✅ **Horizontal Scaling** - Key-value stores scale easily
- ✅ **Caching Friendly** - Easy to cache by key
- ✅ **Denormalized** - No complex query planning

---

## 📚 API FUNCTIONS

All API functions remain the same:

```typescript
// Albums
getAlbums()
getAlbum(id)

// Artists
getArtists()
getArtist(id)

// Ratings
getUserRating(albumId)
saveRating(albumId, rating)

// Reviews
getReviews(albumId)
saveReview(albumId, text)

// Auth
signUp(email, password, username)
getProfile()

// Search
search(query)
```

**No changes needed in UI components!**

---

## 🔧 TROUBLESHOOTING

### Data Not Showing

```sql
-- Check if data exists
SELECT COUNT(*) FROM kv_store WHERE key LIKE 'album:%';

-- Re-run migration
-- (The migration uses ON CONFLICT DO UPDATE, so it's safe to re-run)
```

### Ratings Not Updating

```typescript
// Manually rebuild ratings index
await updateAlbumRatingsIndex(albumId);
```

### Search Not Working

```sql
-- Check GIN index exists
SELECT * FROM pg_indexes WHERE tablename = 'kv_store';

-- Rebuild index if needed
REINDEX INDEX idx_kv_store_value_gin;
```

---

## 📝 NOTES

### Old Tables

The old SQL tables (albums, artists, profiles, etc.) are **NOT deleted** by the migration. They remain as backup. You can:

**Option 1: Keep Both**
- Keep old tables for backup
- Use new KV store for production

**Option 2: Delete Old Tables** (after verifying KV works)
```sql
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
-- Keep profiles table for auth trigger
```

### Triggers

You may want to add triggers to keep data in sync:

```sql
-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_kv_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kv_store_updated_at
  BEFORE UPDATE ON kv_store
  FOR EACH ROW
  EXECUTE FUNCTION update_kv_timestamp();
```

---

## 🎉 SUCCESS!

Your music rating platform now uses a modern key-value storage system while maintaining the exact same UI and user experience!

**Key Files:**
- `/migrate-to-kv.sql` - Migration script
- `/src/app/lib/api-kv.ts` - KV API implementation
- `/src/app/lib/api.ts` - Exports KV API
- `/KV-MIGRATION-GUIDE.md` - This guide
