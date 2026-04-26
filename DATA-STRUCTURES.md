# 🗂️ DATA STRUCTURES QUICK REFERENCE

Visual overview of all data structures in the Music Rating Platform

---

## 📦 CORE DATA STRUCTURES

### 🎵 Album
```typescript
interface Album {
  id: string;                    // "abc-123-def-456"
  title: string;                 // "folklore"
  artist_id: string;             // "xyz-789-abc-012"
  year: number;                  // 2020
  cover_url: string;             // "https://unsplash.com/..."
  description: string;           // "Indie folk masterpiece..."
  tracks: string[];              // ["the 1", "cardigan", ...]
  genre?: string;                // "Indie Folk"
  genres?: string[];             // ["Indie Folk", "Alternative"]
  popularity_score?: number;     // 96 (50-100)
  is_featured?: boolean;         // false
  created_at?: string;           // "2026-04-08T10:00:00Z"
  updated_at?: string;           // "2026-04-08T10:00:00Z"
}
```

**Popularity Score:**
- 🔥 **95-97**: Top Rated
- 📈 **87-89**: Trending
- 📀 **60-89**: Regular

**Featured Status:**
- ✅ `is_featured = true`: Shows in Trending
- ⬜ `is_featured = false`: Regular albums

---

### 🎤 Artist
```typescript
interface Artist {
  id: string;                    // "xyz-789-abc-012"
  name: string;                  // "Taylor Swift"
  genre: string;                 // "Pop"
  bio?: string;                  // "American singer-songwriter..."
  image_url?: string;            // "https://unsplash.com/..."
  formed_year?: number;          // 1989
  country?: string;              // "USA"
  created_at?: string;           // "2026-04-08T10:00:00Z"
}
```

---

### 👤 Profile
```typescript
interface Profile {
  id: string;                    // "user-123-456" (same as auth.users.id)
  username: string;              // "musiclover"
  display_name?: string;         // "Music Lover"
  bio?: string;                  // "I love all kinds of music!"
  avatar_url?: string;           // "https://..."
  created_at?: string;           // "2026-04-08T10:00:00Z"
  updated_at?: string;           // "2026-04-08T10:00:00Z"
}
```

**Auto-Creation:**
- ✅ Created automatically on signup via trigger
- ✅ Username extracted from email
- ✅ Display name defaults to username

---

### ⭐ Rating
```typescript
interface Rating {
  id: string;                    // "rating-123-456"
  user_id: string;               // "user-123-456"
  album_id: string;              // "abc-123-def-456"
  rating: number;                // 4.5 (0.0-5.0)
  created_at?: string;           // "2026-04-08T10:00:00Z"
  updated_at?: string;           // "2026-04-08T10:00:00Z"
}
```

**Constraints:**
- One rating per user per album
- Rating range: 0.0 to 5.0
- Can be updated (upsert)

---

### 📝 Review
```typescript
interface Review {
  id: string;                    // "review-123-456"
  user_id: string;               // "user-123-456"
  album_id: string;              // "abc-123-def-456"
  text: string;                  // "This album is incredible!"
  created_at: string;            // "2026-04-08T10:00:00Z"
  updated_at?: string;           // "2026-04-08T10:00:00Z"
}
```

**Constraints:**
- One review per user per album
- Text required (not null)
- Can be updated (upsert)

---

### 💿 Collection
```typescript
interface Collection {
  id: string;                    // "col-123-456"
  user_id: string;               // "user-123-456"
  album_id: string;              // "abc-123-def-456"
  status: string;                // "owned" | "wishlist" | "favorite"
  added_at?: string;             // "2026-04-08T10:00:00Z"
}
```

**Status Types:**
- 💿 `'owned'`: User owns this album
- 💭 `'wishlist'`: User wants this album
- ⭐ `'favorite'`: User's favorite

---

## 🔗 JOINED DATA STRUCTURES

### Album + Artist
```typescript
interface AlbumWithArtist extends Album {
  artists?: {
    id: string;                  // "xyz-789-abc-012"
    name: string;                // "Taylor Swift"
    genre: string;               // "Pop"
  };
}
```

**Example:**
```json
{
  "id": "abc-123",
  "title": "folklore",
  "year": 2020,
  "popularity_score": 96,
  "artists": {
    "id": "xyz-789",
    "name": "Taylor Swift",
    "genre": "Pop"
  }
}
```

---

### Album + Artist + Ratings
```typescript
interface AlbumWithRatings extends AlbumWithArtist {
  averageRating?: number;        // 4.5 (computed)
  totalRatings?: number;         // 127 (computed)
}
```

**Example:**
```json
{
  "id": "abc-123",
  "title": "folklore",
  "artists": {
    "name": "Taylor Swift"
  },
  "averageRating": 4.5,
  "totalRatings": 127
}
```

---

### Review + Profile
```typescript
interface ReviewWithProfile extends Review {
  profiles: {
    username: string;            // "musiclover"
    avatar_url: string | null;   // "https://..." or null
  };
}
```

**Example:**
```json
{
  "id": "review-123",
  "text": "Amazing album!",
  "created_at": "2026-04-08T10:00:00Z",
  "profiles": {
    "username": "musiclover",
    "avatar_url": "https://..."
  }
}
```

---

## 📊 API RESPONSE TYPES

### Albums Response
```typescript
interface AlbumsResponse {
  albums: AlbumWithRatings[];
}
```

**Example:**
```json
{
  "albums": [
    {
      "id": "abc-123",
      "title": "folklore",
      "artists": { "name": "Taylor Swift" },
      "averageRating": 4.5,
      "totalRatings": 127
    },
    // ... more albums
  ]
}
```

---

### Search Response
```typescript
interface SearchResponse {
  albums: AlbumWithRatings[];
  artists: Artist[];
}
```

**Example:**
```json
{
  "albums": [
    { "id": "abc-123", "title": "folklore", ... }
  ],
  "artists": [
    { "id": "xyz-789", "name": "Taylor Swift", ... }
  ]
}
```

---

## 🎯 COMPUTED FIELDS

These fields are calculated on the frontend, not stored in database:

### Average Rating
```typescript
const averageRating = ratings.length > 0
  ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
  : 0;
```

### Total Ratings
```typescript
const totalRatings = ratings.length;
```

### Rating Distribution
```typescript
const distribution = {
  5: ratings.filter(r => r.rating >= 4.5).length,
  4: ratings.filter(r => r.rating >= 3.5 && r.rating < 4.5).length,
  3: ratings.filter(r => r.rating >= 2.5 && r.rating < 3.5).length,
  2: ratings.filter(r => r.rating >= 1.5 && r.rating < 2.5).length,
  1: ratings.filter(r => r.rating < 1.5).length,
};
```

---

## 🔄 DATA RELATIONSHIPS

```
Profile (User)
    │
    ├─── has many ──→ Ratings
    │                    │
    │                    └──→ belongs to Album
    │
    ├─── has many ──→ Reviews
    │                    │
    │                    └──→ belongs to Album
    │
    └─── has many ──→ Collections
                         │
                         └──→ belongs to Album

Album
    │
    ├─── belongs to ──→ Artist
    │
    ├─── has many ──→ Ratings
    │
    ├─── has many ──→ Reviews
    │
    └─── has many ──→ Collections

Artist
    │
    └─── has many ──→ Albums
```

---

## 📋 SAMPLE DATA

### Top Rated Album
```json
{
  "id": "abc-123-def-456",
  "title": "folklore",
  "artist_id": "xyz-789-abc-012",
  "year": 2020,
  "cover_url": "https://images.unsplash.com/photo-1...",
  "description": "Taylor Swift's eighth studio album...",
  "tracks": [
    "the 1",
    "cardigan",
    "the last great american dynasty",
    "exile (feat. Bon Iver)",
    "my tears ricochet"
  ],
  "genre": "Indie Folk",
  "genres": ["Indie Folk", "Alternative", "Pop"],
  "popularity_score": 96,
  "is_featured": false,
  "artists": {
    "id": "xyz-789-abc-012",
    "name": "Taylor Swift",
    "genre": "Pop"
  },
  "averageRating": 4.5,
  "totalRatings": 127
}
```

---

### Trending Album
```json
{
  "id": "def-456-ghi-789",
  "title": "Certified Lover Boy",
  "artist_id": "mno-345-pqr-678",
  "year": 2021,
  "popularity_score": 89,
  "is_featured": true,
  "artists": {
    "id": "mno-345-pqr-678",
    "name": "Drake",
    "genre": "Hip Hop"
  },
  "averageRating": 3.8,
  "totalRatings": 94
}
```

---

### User Rating
```json
{
  "id": "rating-abc-123",
  "user_id": "user-def-456",
  "album_id": "abc-123-def-456",
  "rating": 4.5,
  "created_at": "2026-04-08T10:00:00Z",
  "updated_at": "2026-04-08T10:00:00Z"
}
```

---

### User Review
```json
{
  "id": "review-xyz-789",
  "user_id": "user-def-456",
  "album_id": "abc-123-def-456",
  "text": "This album is incredible! The production is top-notch and the lyrics are deeply personal. A masterpiece of modern indie folk.",
  "created_at": "2026-04-08T10:00:00Z",
  "profiles": {
    "username": "musiclover",
    "avatar_url": "https://images.unsplash.com/photo-..."
  }
}
```

---

## 🎨 CONSTANTS

### Genres
```typescript
const GENRES = [
  'Rock',
  'Pop',
  'Hip Hop',
  'R&B',
  'Electronic',
  'Jazz',
  'Classical',
  'Country',
  'Alternative',
  'Indie',
  'Metal',
  'Folk',
] as const;
```

### Popularity Ranges
```typescript
const POPULARITY_RANGES = {
  TOP_RATED: { min: 95, max: 97 },
  TRENDING: { min: 87, max: 89 },
  REGULAR: { min: 60, max: 89 },
} as const;
```

### Collection Statuses
```typescript
const COLLECTION_STATUSES = [
  'owned',
  'wishlist',
  'favorite'
] as const;
```

---

## 📁 FILE LOCATIONS

| Type Definition | File |
|----------------|------|
| All Interfaces | `/src/app/types/database.ts` |
| Type Exports | `/src/app/types/index.ts` |
| API Functions | `/src/app/lib/api.ts` |
| Database Schema | `/DATABASE-SCHEMA.md` |
| This Guide | `/DATA-STRUCTURES.md` |

---

## 🚀 USAGE

### Import Types
```typescript
import type { 
  Album, 
  AlbumWithRatings,
  Artist,
  Rating,
  Review,
} from '../types';
```

### Import API Functions
```typescript
import { 
  getAlbums,
  getAlbum,
  saveRating,
  saveReview,
} from '../lib/api';
```

### Use in Component
```typescript
const [albums, setAlbums] = useState<AlbumWithRatings[]>([]);
const [rating, setRating] = useState<Rating | null>(null);

useEffect(() => {
  const load = async () => {
    const { albums } = await getAlbums();
    setAlbums(albums);
  };
  load();
}, []);
```

---

## ✅ TYPE SAFETY CHECKLIST

- ✅ All database tables have TypeScript interfaces
- ✅ All API functions have return types
- ✅ All joined queries have extended interfaces
- ✅ All computed fields are documented
- ✅ All API responses have typed interfaces
- ✅ Constants are typed with `as const`

---

**Your data layer is fully typed and documented!** 🎉
