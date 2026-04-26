# 🗄️ DATABASE SCHEMA

Complete database structure for the Music Rating Platform

---

## 📊 TABLE OVERVIEW

```
┌─────────────┐
│  auth.users │  (Supabase Auth - managed by Supabase)
└──────┬──────┘
       │
       │ 1:1
       ▼
┌─────────────┐
│  profiles   │  User profiles (auto-created on signup)
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       │ 1:many          │ 1:many
       ▼                 ▼
┌─────────────┐    ┌─────────────┐
│   ratings   │    │   reviews   │
└──────┬──────┘    └──────┬──────┘
       │                  │
       │                  │
       │ many:1           │ many:1
       │                  │
       │    ┌─────────────┴────────┐
       │    │                      │
       ▼    ▼                      │ 1:many
    ┌─────────────┐                │
    │   albums    │◄───────────────┘
    └──────┬──────┘
           │
           │ many:1
           ▼
    ┌─────────────┐
    │   artists   │
    └─────────────┘
           ▲
           │
           │ 1:many
    ┌──────┴──────┐
    │ collections │
    └─────────────┘
```

---

## 📋 TABLE DETAILS

### 1. **profiles**

**Purpose:** User profile information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User ID from Supabase Auth |
| `username` | TEXT | UNIQUE, NOT NULL | Username (from email) |
| `display_name` | TEXT | | Display name |
| `bio` | TEXT | | User biography |
| `avatar_url` | TEXT | | Profile picture URL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `profiles_username_idx` on `username`

**RLS Policies:**
- ✅ Everyone can view profiles
- ✅ Users can insert their own profile
- ✅ Users can update their own profile

**Trigger:**
- `on_auth_user_created` - Auto-creates profile when user signs up

**Example Data:**
```json
{
  "id": "a1b2c3d4-...",
  "username": "musiclover",
  "display_name": "Music Lover",
  "bio": "I love all kinds of music!",
  "avatar_url": "https://...",
  "created_at": "2026-04-08T10:00:00Z"
}
```

---

### 2. **artists**

**Purpose:** Artist/band information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Artist ID |
| `name` | TEXT | UNIQUE, NOT NULL | Artist/band name |
| `genre` | TEXT | NOT NULL | Primary genre |
| `bio` | TEXT | | Artist biography |
| `image_url` | TEXT | | Artist image |
| `formed_year` | INTEGER | | Year formed/born |
| `country` | TEXT | | Country of origin |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Example Data:**
```json
{
  "id": "x1y2z3...",
  "name": "Taylor Swift",
  "genre": "Pop",
  "bio": "American singer-songwriter...",
  "image_url": "https://unsplash.com/...",
  "formed_year": 1989,
  "country": "USA"
}
```

---

### 3. **albums**

**Purpose:** Album information with popularity scoring

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Album ID |
| `title` | TEXT | NOT NULL | Album title |
| `artist_id` | UUID | REFERENCES artists(id) | Artist reference |
| `year` | INTEGER | NOT NULL | Release year |
| `cover_url` | TEXT | | Album cover image |
| `description` | TEXT | | Album description |
| `tracks` | TEXT[] | | Array of track names |
| `genre` | TEXT | | Primary genre |
| `genres` | TEXT[] | | Array of genres |
| `popularity_score` | INTEGER | DEFAULT 70 | Popularity (50-100) |
| `is_featured` | BOOLEAN | DEFAULT false | Trending flag |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- Index on `artist_id`
- Index on `popularity_score`
- Index on `is_featured`

**Popularity Score Ranges:**
- **95-97**: Top Rated albums (folklore, Blonde, DAMN.)
- **87-89**: Trending albums (CLB, Midnights)
- **60-89**: Regular albums

**Featured Status:**
- `is_featured = true`: Shows in "Trending Now" section
- `is_featured = false`: Regular albums

**Example Data:**
```json
{
  "id": "abc123...",
  "title": "folklore",
  "artist_id": "x1y2z3...",
  "year": 2020,
  "cover_url": "https://unsplash.com/...",
  "description": "Indie folk masterpiece...",
  "tracks": ["the 1", "cardigan", "the last great american dynasty", ...],
  "genre": "Indie Folk",
  "genres": ["Indie Folk", "Alternative", "Pop"],
  "popularity_score": 96,
  "is_featured": false
}
```

---

### 4. **ratings**

**Purpose:** User album ratings (5-star system)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Rating ID |
| `user_id` | UUID | REFERENCES profiles(id), NOT NULL | User who rated |
| `album_id` | UUID | REFERENCES albums(id), NOT NULL | Album being rated |
| `rating` | DECIMAL(2,1) | NOT NULL, CHECK (0.0-5.0) | Rating value |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Constraints:**
- `UNIQUE(user_id, album_id)` - One rating per user per album

**RLS Policies:**
- ✅ Everyone can view ratings
- ✅ Authenticated users can insert ratings
- ✅ Users can update their own ratings
- ✅ Users can delete their own ratings

**Example Data:**
```json
{
  "id": "rating123...",
  "user_id": "a1b2c3d4...",
  "album_id": "abc123...",
  "rating": 4.5,
  "created_at": "2026-04-08T10:00:00Z"
}
```

---

### 5. **reviews**

**Purpose:** User written album reviews

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Review ID |
| `user_id` | UUID | REFERENCES profiles(id), NOT NULL | Review author |
| `album_id` | UUID | REFERENCES albums(id), NOT NULL | Album being reviewed |
| `text` | TEXT | NOT NULL | Review text |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Constraints:**
- `UNIQUE(user_id, album_id)` - One review per user per album

**RLS Policies:**
- ✅ Everyone can view reviews
- ✅ Authenticated users can insert reviews
- ✅ Users can update their own reviews
- ✅ Users can delete their own reviews

**Example Data:**
```json
{
  "id": "review456...",
  "user_id": "a1b2c3d4...",
  "album_id": "abc123...",
  "text": "This album is incredible! The production is top-notch...",
  "created_at": "2026-04-08T10:00:00Z"
}
```

---

### 6. **collections**

**Purpose:** User album collections (owned, wishlist, favorites)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Collection entry ID |
| `user_id` | UUID | REFERENCES profiles(id), NOT NULL | Collection owner |
| `album_id` | UUID | REFERENCES albums(id), NOT NULL | Album in collection |
| `status` | TEXT | NOT NULL | Collection type |
| `added_at` | TIMESTAMPTZ | DEFAULT NOW() | When added |

**Constraints:**
- `UNIQUE(user_id, album_id)` - One entry per user per album

**Status Values:**
- `'owned'` - User owns this album
- `'wishlist'` - User wants this album
- `'favorite'` - User's favorite album

**RLS Policies:**
- ✅ Users can view their own collections
- ✅ Users can insert to their own collections
- ✅ Users can delete from their own collections

**Example Data:**
```json
{
  "id": "col789...",
  "user_id": "a1b2c3d4...",
  "album_id": "abc123...",
  "status": "favorite",
  "added_at": "2026-04-08T10:00:00Z"
}
```

---

## 🔐 SECURITY (Row Level Security)

All tables have RLS enabled with appropriate policies:

### Public Access:
- ✅ **albums** - Everyone can read
- ✅ **artists** - Everyone can read
- ✅ **profiles** - Everyone can read
- ✅ **ratings** - Everyone can read
- ✅ **reviews** - Everyone can read

### Authenticated Access:
- ✅ **ratings** - Auth users can insert
- ✅ **reviews** - Auth users can insert
- ✅ **collections** - Auth users can manage their own

### User-Specific Access:
- 🔒 **profiles** - Users can only update their own
- 🔒 **ratings** - Users can only update/delete their own
- 🔒 **reviews** - Users can only update/delete their own
- 🔒 **collections** - Users can only view/manage their own

---

## 🔄 AUTO-TRIGGERS

### `on_auth_user_created`

**Fires:** After INSERT on `auth.users`

**Action:** Creates profile automatically

```sql
INSERT INTO profiles (id, username, display_name)
VALUES (
  NEW.id,
  SPLIT_PART(NEW.email, '@', 1),
  SPLIT_PART(NEW.email, '@', 1)
);
```

---

## 📊 COMMON QUERIES

### Get Top Rated Albums
```sql
SELECT * FROM albums
WHERE popularity_score >= 95
ORDER BY popularity_score DESC
LIMIT 8;
```

### Get Trending Albums
```sql
SELECT * FROM albums
WHERE is_featured = true
ORDER BY popularity_score DESC
LIMIT 8;
```

### Get Albums with Artist Info
```sql
SELECT 
  albums.*,
  artists.name as artist_name,
  artists.genre as artist_genre
FROM albums
JOIN artists ON albums.artist_id = artists.id
ORDER BY popularity_score DESC;
```

### Get Reviews with Author Info
```sql
SELECT 
  reviews.*,
  profiles.username,
  profiles.avatar_url
FROM reviews
JOIN profiles ON reviews.user_id = profiles.id
WHERE reviews.album_id = $1
ORDER BY reviews.created_at DESC;
```

### Get Album Rating Statistics
```sql
SELECT 
  album_id,
  COUNT(*) as total_ratings,
  AVG(rating) as average_rating,
  MIN(rating) as min_rating,
  MAX(rating) as max_rating
FROM ratings
WHERE album_id = $1
GROUP BY album_id;
```

### Get User's Rated Albums
```sql
SELECT 
  albums.*,
  artists.name as artist_name,
  ratings.rating as user_rating
FROM ratings
JOIN albums ON ratings.album_id = albums.id
JOIN artists ON albums.artist_id = artists.id
WHERE ratings.user_id = $1
ORDER BY ratings.created_at DESC;
```

---

## 📈 DATA STATISTICS

### Current Data (After Population):

- **Artists**: ~30+ artists across multiple genres
- **Albums**: ~100+ albums from popular artists
- **Top Rated**: 8 albums with popularity_score >= 95
- **Trending**: 9 albums with is_featured = true
- **Genres**: Rock, Pop, Hip Hop, R&B, Electronic, etc.

---

## 🎯 USAGE IN APP

### Home Page
```typescript
// Top Rated
const topRated = albums
  .sort((a, b) => b.popularity_score - a.popularity_score)
  .slice(0, 4);

// Trending
const trending = albums
  .filter(a => a.is_featured === true)
  .sort((a, b) => b.popularity_score - a.popularity_score)
  .slice(0, 4);

// Recently Added
const recent = albums
  .sort((a, b) => b.year - a.year)
  .slice(0, 4);
```

### Album Detail Page
```typescript
// Get album with artist
const { data: album } = await supabase
  .from('albums')
  .select('*, artists(*)')
  .eq('id', albumId)
  .single();

// Get reviews with profiles
const { data: reviews } = await supabase
  .from('reviews')
  .select('*, profiles(username, avatar_url)')
  .eq('album_id', albumId);

// Get ratings
const { data: ratings } = await supabase
  .from('ratings')
  .select('rating')
  .eq('album_id', albumId);
```

---

## 🔧 MAINTENANCE

### Add Top Rated Album
```sql
UPDATE albums 
SET popularity_score = 95 
WHERE title ILIKE '%album name%';
```

### Add Trending Album
```sql
UPDATE albums 
SET is_featured = true, popularity_score = 88 
WHERE title ILIKE '%album name%';
```

### Reset Featured Status
```sql
UPDATE albums SET is_featured = false;
```

### View Table Statistics
```sql
SELECT 
  'albums' as table, COUNT(*) FROM albums
UNION ALL
SELECT 'artists', COUNT(*) FROM artists
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'ratings', COUNT(*) FROM ratings
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'collections', COUNT(*) FROM collections;
```

---

## 📁 Related Files

- `/src/app/types/database.ts` - TypeScript type definitions
- `/fix-database-errors.sql` - Table creation script
- `/quick-populate.sql` - Quick data population
- `/populate-ratings.sql` - Comprehensive data population
- `/verify-setup.sql` - Verification queries
