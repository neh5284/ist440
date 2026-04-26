-- ========================================
-- FIX DATABASE ERRORS
-- ========================================
-- This will create the missing profiles table
-- and set up proper policies
-- ========================================

-- 1. CREATE PROFILES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- ========================================
-- 2. CREATE TRIGGER FOR AUTO-PROFILE CREATION
-- ========================================
-- This automatically creates a profile when a user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 3. SET UP ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ========================================
-- 4. CREATE COLLECTIONS TABLE (if not exists)
-- ========================================
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'owned',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, album_id)
);

-- Enable RLS on collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own collections
DROP POLICY IF EXISTS "Users can view their own collections" ON public.collections;
CREATE POLICY "Users can view their own collections"
  ON public.collections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert into their own collections
DROP POLICY IF EXISTS "Users can insert into their own collections" ON public.collections;
CREATE POLICY "Users can insert into their own collections"
  ON public.collections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete from their own collections
DROP POLICY IF EXISTS "Users can delete from their own collections" ON public.collections;
CREATE POLICY "Users can delete from their own collections"
  ON public.collections
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 5. UPDATE RATINGS TABLE POLICIES (if needed)
-- ========================================

-- Enable RLS on ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view ratings
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON public.ratings;
CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert ratings
DROP POLICY IF EXISTS "Authenticated users can insert ratings" ON public.ratings;
CREATE POLICY "Authenticated users can insert ratings"
  ON public.ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own ratings
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.ratings;
CREATE POLICY "Users can update their own ratings"
  ON public.ratings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own ratings
DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.ratings;
CREATE POLICY "Users can delete their own ratings"
  ON public.ratings
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 6. UPDATE REVIEWS TABLE POLICIES
-- ========================================

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert reviews
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reviews
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews"
  ON public.reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 7. CREATE HELPER FUNCTION FOR PROFILE CREATION
-- ========================================
-- This allows manual profile creation if needed

CREATE OR REPLACE FUNCTION public.create_profile_for_user(user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  SELECT 
    id,
    SPLIT_PART(email, '@', 1),
    SPLIT_PART(email, '@', 1)
  FROM auth.users
  WHERE id = user_id
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. CREATE PROFILES FOR EXISTING USERS
-- ========================================
-- This creates profiles for any users that already exist

INSERT INTO public.profiles (id, username, display_name)
SELECT 
  id,
  SPLIT_PART(email, '@', 1),
  SPLIT_PART(email, '@', 1)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check profiles table exists
SELECT 'Profiles table created' as status, COUNT(*) as profile_count
FROM public.profiles;

-- Check if trigger exists
SELECT 'Trigger exists' as status, tgname as trigger_name
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Check RLS policies
SELECT 
  'RLS Policies' as status,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'ratings', 'reviews', 'collections')
ORDER BY tablename, policyname;
