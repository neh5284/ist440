# 🚀 QUICK REFERENCE - What's What

## 📋 Database Fields You're Using:

| Field | Type | Purpose | Values |
|-------|------|---------|--------|
| `popularity_score` | integer | Determines ranking | 50-97 |
| `is_featured` | boolean | Marks trending albums | true/false |

---

## 🎯 How Each Section Works:

### 🔥 Top Rated Albums
```javascript
albums
  .sort((a, b) => b.popularity_score - a.popularity_score)
  .slice(0, 4)
```
**Shows**: Highest popularity_score albums (Blonde, folklore, DAMN., etc.)

---

### 📈 Trending Now
```javascript
albums
  .filter(album => album.is_featured === true)
  .sort((a, b) => b.popularity_score - a.popularity_score)
  .slice(0, 4)
```
**Shows**: Featured albums only (CLB, Midnights, Her Loss, etc.)

---

### 🕒 Recently Added
```javascript
albums
  .sort((a, b) => b.year - a.year)
  .slice(0, 4)
```
**Shows**: Newest albums by year

---

## 🔧 Quick SQL Commands:

### Add to Top Rated:
```sql
UPDATE albums SET popularity_score = 95 
WHERE title ILIKE '%album name%';
```

### Add to Trending:
```sql
UPDATE albums SET is_featured = true, popularity_score = 88
WHERE title ILIKE '%album name%';
```

### Remove from Trending:
```sql
UPDATE albums SET is_featured = false
WHERE title ILIKE '%album name%';
```

### See What You Have:
```sql
-- Top Rated
SELECT title FROM albums WHERE popularity_score >= 95;

-- Trending
SELECT title FROM albums WHERE is_featured = true;
```

---

## 🐛 Debugging Checklist:

- [ ] Ran SQL to set popularity_score and is_featured
- [ ] Checked `/verify-setup.sql` - albums exist with correct values
- [ ] Refreshed browser
- [ ] Opened console (F12) - see debug logs
- [ ] No errors in console
- [ ] Network tab shows albums with popularity_score and is_featured

---

## 📁 Key Files:

| File | What It Does |
|------|--------------|
| `/src/app/pages/Home.tsx` | Homepage with 3 sections |
| `/src/app/pages/Charts.tsx` | Charts page |
| `/src/app/lib/api.ts` | API calls to server |
| `/supabase/functions/server/index.tsx` | Backend server |
| `/verify-setup.sql` | Check database setup |

---

## 💡 Remember:

- Top Rated = **popularity_score** (95-97)
- Trending = **is_featured = true** (87-89)
- NO complex ratings logic needed
- Everything is database-driven
- Simple and fast! 🚀
