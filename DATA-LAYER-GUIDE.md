# 📊 DATA LAYER DOCUMENTATION

Complete guide to the data layer architecture for the Music Rating Platform

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                   │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Pages      │  │  Components  │  │   Hooks    │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                 │        │
│         └─────────────────┴─────────────────┘        │
│                           │                          │
└───────────────────────────┼──────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────┐
│                   DATA LAYER                         │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  /src/app/lib/api.ts                         │   │
│  │  - getAlbums()                               │   │
│  │  - getAlbum(id)                              │   │
│  │  - getArtists()                              │   │
│  │  - getArtist(id)                             │   │
│  │  - getUserRating(albumId)                    │   │
│  │  - saveRating(albumId, rating)               │   │
│  │  - getReviews(albumId)                       │   │
│  │  - saveReview(albumId, text)                 │   │
│  │  - signUp(email, password, username)         │   │
│  │  - getProfile()                              │   │
│  │  - search(query)                             │   │
│  └─────────────────┬────────────────────────────┘   │
│                    │                                 │
│  ┌─────────────────┴────────────────────────────┐   │
│  │  /src/app/lib/supabase.ts                    │   │
│  │  - Supabase Client Configuration             │   │
│  └─────────────────┬────────────────────────────┘   │
│                    │                                 │
│  ┌─────────────────┴────────────────────────────┐   │
│  │  /src/app/types/database.ts                  │   │
│  │  - TypeScript Interfaces                     │   │
│  │  - Type Definitions                          │   │
│  └──────────────────────────────────────────────┘   │
└───────────────────────────┼──────────────────────────┘
                            │
                            ▼ Direct Queries
┌─────────────────────────────────────────────────────┐
│                 SUPABASE DATABASE                    │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ albums   │  │ artists  │  │ profiles │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐        │
│  │ ratings  │  │ reviews  │  │collections │        │
│  └──────────┘  └──────────┘  └────────────┘        │
└─────────────────────────────────────────────────────┘
```

---

## 📁 FILE STRUCTURE

```
/src/app/
├── lib/
│   ├── api.ts              # API functions (data layer)
│   └── supabase.ts         # Supabase client config
│
├── types/
│   ├── database.ts         # Database type definitions
│   └── index.ts            # Type exports
│
├── pages/
│   ├── Home.tsx            # Uses: getAlbums()
│   ├── AlbumDetail.tsx     # Uses: getAlbum(), saveRating(), saveReview()
│   ├── ArtistDetail.tsx    # Uses: getArtist()
│   ├── Charts.tsx          # Uses: getAlbums()
│   ├── Search.tsx          # Uses: search()
│   └── Profile.tsx         # Uses: getProfile()
│
└── components/
    └── [various components using data from props]

/root/
├── DATABASE-SCHEMA.md      # Database schema documentation
└── fix-database-errors.sql # Database setup script
```

---

## 🎯 DATA LAYER FUNCTIONS

### **Albums**

#### `getAlbums()`
**Purpose:** Fetch all albums with artist info and ratings

**Returns:** `{ albums: AlbumWithRatings[] }`

**Query:**
```typescript
const { data: albums } = await supabase
  .from('albums')
  .select(`
    *,
    artists (
      id,
      name,
      genre
    )
  `)
  .order('popularity_score', { ascending: false });
```

**Used In:**
- Home page (Top Rated, Trending, Recently Added)
- Charts page
- Album listings

---

#### `getAlbum(id: string)`
**Purpose:** Fetch single album with details

**Returns:** `AlbumWithRatings`

**Query:**
```typescript
const { data: album } = await supabase
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

**Used In:**
- Album detail page

---

### **Artists**

#### `getArtists()`
**Purpose:** Fetch all artists

**Returns:** `{ artists: Artist[] }`

**Query:**
```typescript
const { data } = await supabase
  .from('artists')
  .select('*')
  .order('name', { ascending: true });
```

**Used In:**
- Artists page
- Search results

---

#### `getArtist(id: string)`
**Purpose:** Fetch single artist with albums

**Returns:** `ArtistWithAlbums`

**Query:**
```typescript
const { data: artist } = await supabase
  .from('artists')
  .select('*')
  .eq('id', id)
  .single();

const { data: albums } = await supabase
  .from('albums')
  .select('*')
  .eq('artist_id', id);
```

**Used In:**
- Artist detail page

---

### **Ratings**

#### `getUserRating(albumId: string)`
**Purpose:** Get current user's rating for an album

**Returns:** `Rating | null`

**Query:**
```typescript
const { data } = await supabase
  .from('ratings')
  .select('*')
  .eq('album_id', albumId)
  .eq('user_id', userId)
  .single();
```

**Used In:**
- Album detail page (show user's rating)

---

#### `saveRating(albumId: string, rating: number)`
**Purpose:** Save or update user's rating

**Returns:** `Rating`

**Query:**
```typescript
const { data } = await supabase
  .from('ratings')
  .upsert({
    user_id: userId,
    album_id: albumId,
    rating: rating,
  });
```

**Used In:**
- Album detail page (star rating component)

---

### **Reviews**

#### `getReviews(albumId: string)`
**Purpose:** Get all reviews for an album

**Returns:** `ReviewWithProfile[]`

**Query:**
```typescript
const { data } = await supabase
  .from('reviews')
  .select(`
    *,
    profiles (
      username,
      avatar_url
    )
  `)
  .eq('album_id', albumId)
  .order('created_at', { ascending: false });
```

**Used In:**
- Album detail page (reviews section)

---

#### `saveReview(albumId: string, text: string)`
**Purpose:** Save or update user's review

**Returns:** `Review`

**Query:**
```typescript
const { data } = await supabase
  .from('reviews')
  .upsert({
    user_id: userId,
    album_id: albumId,
    text: text,
  });
```

**Used In:**
- Album detail page (review form)

---

### **Authentication**

#### `signUp(email: string, password: string, username: string)`
**Purpose:** Create new user account and profile

**Returns:** `AuthResponse`

**Process:**
1. Create auth user via `supabase.auth.signUp()`
2. Create profile record in `profiles` table
3. Auto-trigger also creates profile (backup)

**Used In:**
- Sign up form

---

#### `getProfile()`
**Purpose:** Get current user's profile

**Returns:** `Profile`

**Query:**
```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

**Used In:**
- Profile page
- User navigation

---

### **Search**

#### `search(query: string)`
**Purpose:** Search albums and artists

**Returns:** `SearchResponse`

**Queries:**
```typescript
// Search albums
const { data: albums } = await supabase
  .from('albums')
  .select(`
    *,
    artists (
      id,
      name,
      genre
    )
  `)
  .ilike('title', `%${query}%`)
  .limit(10);

// Search artists
const { data: artists } = await supabase
  .from('artists')
  .select('*')
  .ilike('name', `%${query}%`)
  .limit(10);
```

**Used In:**
- Search page
- Search bar component

---

## 🎨 DATA FLOW EXAMPLES

### Example 1: Home Page Loading

```typescript
// 1. Page component fetches data
useEffect(() => {
  const loadAlbums = async () => {
    const { albums } = await getAlbums();
    setAlbums(albums);
  };
  loadAlbums();
}, []);

// 2. getAlbums() queries Supabase
const { data: albums } = await supabase.from('albums').select(...);

// 3. Process ratings for each album
const albumsWithRatings = await Promise.all(
  albums.map(async (album) => {
    const { data: ratings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('album_id', album.id);
    
    return {
      ...album,
      averageRating: calculateAverage(ratings),
      totalRatings: ratings.length,
    };
  })
);

// 4. Sort and categorize
const topRated = albums
  .sort((a, b) => b.popularity_score - a.popularity_score)
  .slice(0, 4);

const trending = albums
  .filter(a => a.is_featured)
  .slice(0, 4);
```

---

### Example 2: Rating an Album

```typescript
// 1. User clicks star rating
const handleRate = async (rating: number) => {
  try {
    // 2. Call API function
    await saveRating(albumId, rating);
    
    // 3. Update local state
    setUserRating(rating);
    
    // 4. Refresh album data
    const updatedAlbum = await getAlbum(albumId);
    setAlbum(updatedAlbum);
    
    toast.success('Rating saved!');
  } catch (error) {
    toast.error('Failed to save rating');
  }
};
```

---

### Example 3: Posting a Review

```typescript
// 1. User submits review form
const handleSubmit = async (text: string) => {
  if (!user) {
    toast.error('Please sign in to review');
    return;
  }
  
  try {
    // 2. Save review
    await saveReview(albumId, text);
    
    // 3. Refresh reviews
    const updatedReviews = await getReviews(albumId);
    setReviews(updatedReviews);
    
    // 4. Clear form
    setReviewText('');
    
    toast.success('Review posted!');
  } catch (error) {
    toast.error('Failed to post review');
  }
};
```

---

## 🔒 SECURITY & PERMISSIONS

### Row Level Security (RLS)

All tables have RLS enabled. Policies are defined in `/fix-database-errors.sql`.

**Read Access (Everyone):**
- ✅ albums
- ✅ artists
- ✅ profiles
- ✅ ratings
- ✅ reviews

**Write Access (Authenticated Users):**
- ✅ ratings (can insert/update/delete own)
- ✅ reviews (can insert/update/delete own)
- ✅ profiles (can update own)
- ✅ collections (can manage own)

**Enforced by Database:**
- Users can't rate/review without authentication
- Users can't edit other users' ratings/reviews
- Users can't see other users' collections
- All enforced at database level (secure!)

---

## 📊 COMPUTED FIELDS

Some fields are computed on the frontend:

### `averageRating`
```typescript
const averageRating = ratings.length > 0
  ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
  : 0;
```

### `totalRatings`
```typescript
const totalRatings = ratings.length;
```

These are calculated when fetching albums to avoid complex database queries.

---

## 🎯 SORTING & FILTERING

### Top Rated Albums
```typescript
albums.sort((a, b) => b.popularity_score - a.popularity_score)
```

### Trending Albums
```typescript
albums.filter(a => a.is_featured === true)
  .sort((a, b) => b.popularity_score - a.popularity_score)
```

### Recently Added
```typescript
albums.sort((a, b) => b.year - a.year)
```

### By Rating (Charts)
```typescript
albums.sort((a, b) => b.averageRating - a.averageRating)
```

### By Number of Ratings (Charts)
```typescript
albums.sort((a, b) => b.totalRatings - a.totalRatings)
```

---

## 🚀 PERFORMANCE CONSIDERATIONS

### Caching Strategy
- Currently no caching (direct queries)
- Consider React Query for future optimization
- Browser caches Supabase responses

### Query Optimization
- Use `select()` to fetch only needed fields
- Use `limit()` for large result sets
- Use `order()` for database-level sorting
- Use joins (`artists(...)`) to reduce requests

### Future Improvements
- Add React Query for caching
- Implement pagination for large lists
- Add optimistic updates
- Add loading skeletons

---

## 🔧 ERROR HANDLING

All API functions include error handling:

```typescript
try {
  const { data, error } = await supabase.from('albums').select();
  
  if (error) {
    console.error('Error:', error);
    throw new Error(error.message);
  }
  
  return data;
} catch (error) {
  console.error('Failed to fetch albums:', error);
  throw error;
}
```

Components should wrap API calls in try/catch:

```typescript
try {
  const albums = await getAlbums();
  setAlbums(albums);
} catch (error) {
  setError('Failed to load albums');
}
```

---

## 📖 USAGE EXAMPLES

### In a Component:

```typescript
import { getAlbums, saveRating } from '../lib/api';
import type { AlbumWithRatings } from '../types';

function MyComponent() {
  const [albums, setAlbums] = useState<AlbumWithRatings[]>([]);
  
  useEffect(() => {
    loadAlbums();
  }, []);
  
  const loadAlbums = async () => {
    try {
      const { albums } = await getAlbums();
      setAlbums(albums);
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleRate = async (albumId: string, rating: number) => {
    try {
      await saveRating(albumId, rating);
      await loadAlbums(); // Refresh
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div>
      {albums.map(album => (
        <div key={album.id}>
          <h3>{album.title}</h3>
          <StarRating 
            value={album.averageRating} 
            onRate={(rating) => handleRate(album.id, rating)}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 📚 RELATED FILES

- `/src/app/lib/api.ts` - API functions
- `/src/app/lib/supabase.ts` - Supabase config
- `/src/app/types/database.ts` - Type definitions
- `/src/app/types/index.ts` - Type exports
- `/DATABASE-SCHEMA.md` - Database schema
- `/fix-database-errors.sql` - Database setup

---

## 🎉 SUMMARY

**Data Layer Features:**
- ✅ Direct Supabase queries (fast & simple)
- ✅ TypeScript types for safety
- ✅ Row Level Security (secure)
- ✅ Real-time capable (Supabase feature)
- ✅ Clean API abstraction
- ✅ Error handling built-in
- ✅ Easy to maintain

**Key Principles:**
1. Keep data layer separate from UI
2. Use TypeScript for type safety
3. Leverage Supabase RLS for security
4. Handle errors gracefully
5. Keep queries simple and readable
