# 🚀 QUICK MIGRATION INSTRUCTIONS

Follow these steps to migrate to key-value storage:

---

## STEP 1: Run Migration in Supabase

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Migration**
   - Copy the entire contents of `/migrate-to-kv.sql`
   - Paste into the SQL editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Wait for Completion**
   - Should take 5-30 seconds depending on data size
   - You'll see: "✅ Migration to Key-Value Storage Complete!"

---

## STEP 2: Verify Migration

Run this verification query in SQL Editor:

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

**Expected Results:**
```
type         | count
-------------+-------
albums       | 100+    ✅
artists      | 30+     ✅
indexes      | 15+     ✅
profiles     | varies
ratings      | varies
reviews      | varies
```

---

## STEP 3: Test a Query

Run this test query:

```sql
-- Get a sample album
SELECT * FROM kv_store WHERE key LIKE 'album:%' LIMIT 1;

-- Get the albums index
SELECT * FROM kv_store WHERE key = 'index:albums';

-- Test helper function
SELECT get_album_with_ratings(
  (SELECT value->>'id' FROM kv_store WHERE key LIKE 'album:%' LIMIT 1)
);
```

---

## STEP 4: Refresh Your App

The app code is already updated! Just refresh your browser:

1. **Refresh browser** (Cmd/Ctrl + R)
2. **Check home page** - Albums should load
3. **Click an album** - Detail page should work
4. **Try rating** - Should save to KV store
5. **Search** - Should find albums/artists

---

## 🎉 DONE!

Your app now uses key-value storage!

### What Changed:
- ✅ Data stored in `kv_store` table (JSONB)
- ✅ API uses `/src/app/lib/api-kv.ts`
- ✅ UI works exactly the same
- ✅ Faster queries (no JOINs)
- ✅ Flexible schema (easy to update)

### What Stayed the Same:
- ✅ All pages work unchanged
- ✅ All components work unchanged
- ✅ User experience identical
- ✅ Security (RLS) still enforced

---

## 📊 View Your Data

**In Supabase Dashboard:**

1. Go to "Table Editor"
2. Select `kv_store` table
3. Browse your key-value data!

**Example Keys to Search:**
- `album:%` - All albums
- `artist:%` - All artists
- `index:albums` - Albums index
- `index:albums:featured` - Featured albums

---

## 🔄 Rollback (if needed)

If something goes wrong, you can rollback:

```sql
-- Old tables are still there!
-- Just switch back in /src/app/lib/api.ts

-- Delete KV data (if you want)
DROP TABLE kv_store CASCADE;
```

Then update `/src/app/lib/api.ts` to use the old SQL queries.

---

## 📚 More Info

- **Full Guide**: `/KV-MIGRATION-GUIDE.md`
- **Migration SQL**: `/migrate-to-kv.sql`
- **KV API Code**: `/src/app/lib/api-kv.ts`

---

## ❓ Troubleshooting

### Albums not loading?
```sql
-- Check if albums exist
SELECT COUNT(*) FROM kv_store WHERE key LIKE 'album:%';

-- Re-run migration if count is 0
```

### Ratings not saving?
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'kv_store';
```

### Data looks wrong?
```sql
-- Re-run migration (safe to run multiple times)
-- Just copy/paste migrate-to-kv.sql again
```

---

**Need help? Check `/KV-MIGRATION-GUIDE.md` for detailed documentation!**
