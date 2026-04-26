# 🎵 Setup Instructions - Populate Top Rated & Trending Albums

## 📋 What You Need To Do

Follow these steps to populate your database with realistic ratings data:

---

## ✅ STEP 1: Choose Your SQL Script

You have two options:

### Option A: **Quick Populate** (Recommended - 5 minutes)
- File: `quick-populate.sql`
- Adds ratings to specific albums only
- Guaranteed to work with known album titles
- **Use this if you want fast, reliable results**

### Option B: **Full Populate** (Complete - 10 minutes)
- File: `populate-ratings.sql`
- Tries to find albums by pattern matching
- Adds ratings to more albums
- **Use this for comprehensive data**

---

## ✅ STEP 2: Run the SQL Script

1. **Open Supabase Dashboard**
   - Go to your project at supabase.com
   - Click on **SQL Editor** in the left sidebar

2. **Create New Query**
   - Click **"New Query"**
   - Copy the entire contents of your chosen SQL file
   - Paste it into the editor

3. **Run the Script**
   - Click **"Run"** or press `Ctrl+Enter` / `Cmd+Enter`
   - Wait for completion (you'll see green success messages)

4. **Check the Output**
   - You should see messages like:
     ```
     Added 22 ratings (4.5-5.0) for: %folklore%
     Added 45 ratings (3.8-4.5) for: %Certified Lover Boy%
     ```
   - At the end, you'll see verification tables showing:
     - 🔥 TOP RATED albums (high ratings, moderate count)
     - 📈 TRENDING albums (high count, moderate ratings)

---

## ✅ STEP 3: Verify It Worked

### In Supabase:
Run this query to check:
```sql
SELECT 
  a.title,
  COUNT(r.id) as total_ratings,
  ROUND(AVG(r.rating)::numeric, 2) as avg_rating
FROM albums a
LEFT JOIN ratings r ON r.album_id = a.id
GROUP BY a.id, a.title
HAVING COUNT(r.id) > 0
ORDER BY COUNT(r.id) DESC
LIMIT 20;
```

You should see albums with varied ratings counts.

### In Your App:
1. Refresh your app
2. Open browser console (F12)
3. Look for these logs:
   ```javascript
   Top Rated Albums: [
     { title: "folklore", avgRating: "4.73", totalRatings: 22 },
     { title: "To Pimp a Butterfly", avgRating: "4.81", totalRatings: 28 }
   ]
   
   Trending Albums: [
     { title: "Certified Lover Boy", avgRating: "4.12", totalRatings: 45 },
     { title: "Astroworld", avgRating: "4.35", totalRatings: 44 }
   ]
   ```

---

## 📊 Expected Results

### 🔥 Top Rated Albums (High Quality)
Should include:
- **Taylor Swift**: folklore, evermore, 1989
- **Kendrick Lamar**: To Pimp a Butterfly, DAMN., good kid m.A.A.d city
- **Frank Ocean**: Blonde, Channel Orange

**Characteristics:**
- Average Rating: **4.5 - 5.0 stars**
- Total Ratings: **15 - 28 ratings**

---

### 📈 Trending Albums (High Engagement)
Should include:
- **Drake**: Certified Lover Boy, Her Loss, Honestly Nevermind, Scorpion, Views
- **Taylor Swift**: Midnights, Red
- **The Weeknd**: After Hours, Starboy
- **Travis Scott**: Astroworld

**Characteristics:**
- Average Rating: **3.7 - 4.5 stars**
- Total Ratings: **35 - 45 ratings** (MORE than Top Rated)

---

## 🎯 What Makes Them Different?

| Section | Sort By | Key Metric |
|---------|---------|------------|
| **Top Rated** | Highest average rating | **Quality** (best albums) |
| **Trending** | Most total ratings | **Engagement** (most discussed) |

**NO OVERLAP**: Albums in Top Rated are automatically excluded from Trending!

---

## 🐛 Troubleshooting

### Problem: "Album not found" messages

**Cause**: The album titles in your database don't match the patterns

**Solution**: 
1. Check what albums you actually have:
   ```sql
   SELECT id, title FROM albums LIMIT 50;
   ```

2. Manually add ratings to specific albums:
   ```sql
   -- Example: Add ratings to a specific album
   INSERT INTO ratings (user_id, album_id, rating, created_at)
   SELECT 
     gen_random_uuid(),
     'YOUR_ALBUM_ID_HERE',
     4.5 + (RANDOM() * 0.5),
     NOW()
   FROM generate_series(1, 20);
   ```

---

### Problem: Sections still show same albums

**Cause**: Not enough varied data

**Solution**: 
1. Run the SQL script again (it will add more ratings)
2. Check browser console for debug logs
3. Make sure you have at least 10-15 albums with ratings

---

### Problem: No albums showing at all

**Cause**: No ratings in database

**Solution**:
1. Check if ratings exist:
   ```sql
   SELECT COUNT(*) FROM ratings;
   ```

2. If count = 0, run the SQL script again
3. Check for error messages in Supabase

---

## 🔄 Need to Start Over?

To completely reset and try again:

```sql
-- Delete all ratings
DELETE FROM ratings;

-- Reset all popularity scores
UPDATE albums SET popularity_score = 50;

-- Then run your chosen SQL script again
```

---

## ✨ You're Done!

After running the script, your homepage should show:

✅ **Top Rated**: High-quality albums from critically acclaimed artists  
✅ **Trending**: Popular albums with lots of discussion  
✅ **No duplicates** between sections  
✅ **Real variety** in your data  

Enjoy your music rating platform! 🎉
