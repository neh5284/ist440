import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njairecvlzrgqickmqdl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qYWlyZWN2bHpyZ3FpY2ttcWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzgyMTgsImV4cCI6MjA4ODA1NDIxOH0.-yrrf4SLVfiA4kTct6y7VhOF4Oemuzvxl3Y6J49vqjY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('=== ALBUMS ===');
  const { data: albums, error: albumsError } = await supabase
    .from('albums')
    .select('*')
    .limit(5);
  
  if (albumsError) {
    console.log('Albums Error:', albumsError.message);
  } else {
    console.log('Total albums fetched:', albums?.length || 0);
    albums?.forEach((album, i) => {
      console.log(`${i + 1}. ${album.title} (${album.year})`);
    });
  }

  console.log('\n=== ARTISTS ===');
  const { data: artists, error: artistsError } = await supabase
    .from('artists')
    .select('*')
    .limit(5);
  
  if (artistsError) {
    console.log('Artists Error:', artistsError.message);
  } else {
    console.log('Total artists fetched:', artists?.length || 0);
    artists?.forEach((artist, i) => {
      console.log(`${i + 1}. ${artist.name}`);
    });
  }

  console.log('\n=== RATINGS ===');
  const { data: ratings, error: ratingsError } = await supabase
    .from('ratings')
    .select('*')
    .limit(10);
  
  if (ratingsError) {
    console.log('Ratings Error:', ratingsError.message);
  } else {
    console.log('Total ratings fetched:', ratings?.length || 0);
  }

  console.log('\n=== REVIEWS ===');
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .limit(5);
  
  if (reviewsError) {
    console.log('Reviews Error:', reviewsError.message);
  } else {
    console.log('Total reviews fetched:', reviews?.length || 0);
  }
}

checkDatabase();
