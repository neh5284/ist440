export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  year: number;
  coverUrl: string;
  genres: string[];
  averageRating: number;
  totalRatings: number;
  description: string;
  tracks: string[];
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  bio: string;
  genres: string[];
  albums: Album[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  albumId: string;
  rating: number;
  text: string;
  date: string;
  likes: number;
}

export const albums: Album[] = [
  {
    id: "1",
    title: "In Rainbows",
    artist: "Radiohead",
    artistId: "1",
    year: 2007,
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop",
    genres: ["Art Rock", "Alternative", "Electronic"],
    averageRating: 4.7,
    totalRatings: 12453,
    description: "Radiohead's seventh studio album, released independently. A masterpiece of atmospheric rock and electronic experimentation.",
    tracks: ["15 Step", "Bodysnatchers", "Nude", "Weird Fishes/Arpeggi", "All I Need", "Faust Arp", "Reckoner", "House of Cards", "Jigsaw Falling Into Place", "Videotape"]
  },
  {
    id: "2",
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    artistId: "2",
    year: 2015,
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
    genres: ["Hip Hop", "Jazz Rap", "Conscious Hip Hop"],
    averageRating: 4.8,
    totalRatings: 18234,
    description: "A landmark album blending jazz, funk, and soul with powerful social commentary. Kendrick's magnum opus.",
    tracks: ["Wesley's Theory", "For Free?", "King Kunta", "Institutionalized", "These Walls", "u", "Alright", "For Sale?", "Momma", "Hood Politics", "How Much a Dollar Cost", "Complexion", "The Blacker the Berry", "You Ain't Gotta Lie", "i", "Mortal Man"]
  },
  {
    id: "3",
    title: "Bloom",
    artist: "Beach House",
    artistId: "3",
    year: 2012,
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop",
    genres: ["Dream Pop", "Indie Pop", "Shoegaze"],
    averageRating: 4.4,
    totalRatings: 8932,
    description: "Beach House's fourth album, featuring lush, ethereal soundscapes and hypnotic melodies.",
    tracks: ["Myth", "Wild", "Lazuli", "Other People", "The Hours", "Troublemaker", "New Year", "Wishes", "On the Sea", "Irene"]
  },
  {
    id: "4",
    title: "Rumours",
    artist: "Fleetwood Mac",
    artistId: "4",
    year: 1977,
    coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=500&fit=crop",
    genres: ["Rock", "Pop Rock", "Soft Rock"],
    averageRating: 4.5,
    totalRatings: 15678,
    description: "One of the best-selling albums of all time, born from the chaos of personal relationships within the band.",
    tracks: ["Second Hand News", "Dreams", "Never Going Back Again", "Don't Stop", "Go Your Own Way", "Songbird", "The Chain", "You Make Loving Fun", "I Don't Want to Know", "Oh Daddy", "Gold Dust Woman"]
  },
  {
    id: "5",
    title: "Vespertine",
    artist: "Björk",
    artistId: "5",
    year: 2001,
    coverUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=500&fit=crop",
    genres: ["Art Pop", "Electronic", "Experimental"],
    averageRating: 4.6,
    totalRatings: 9876,
    description: "An intimate, delicate exploration of love and domesticity, featuring intricate production and microbeats.",
    tracks: ["Hidden Place", "Cocoon", "It's Not Up to You", "Undo", "Pagan Poetry", "Frosti", "Aurora", "An Echo, a Stain", "Sun in My Mouth", "Heirloom", "Harm of Will", "Unison"]
  },
  {
    id: "6",
    title: "Loveless",
    artist: "My Bloody Valentine",
    artistId: "6",
    year: 1991,
    coverUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&h=500&fit=crop",
    genres: ["Shoegaze", "Noise Pop", "Dream Pop"],
    averageRating: 4.6,
    totalRatings: 11234,
    description: "The definitive shoegaze album, known for its innovative production and wall of sound approach.",
    tracks: ["Only Shallow", "Loomer", "Touched", "To Here Knows When", "When You Sleep", "I Only Said", "Come in Alone", "Sometimes", "Blown a Wish", "What You Want", "Soon"]
  },
  {
    id: "7",
    title: "The Glow Pt. 2",
    artist: "The Microphones",
    artistId: "7",
    year: 2001,
    coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&h=500&fit=crop",
    genres: ["Indie Folk", "Lo-Fi", "Experimental"],
    averageRating: 4.5,
    totalRatings: 7654,
    description: "A sprawling, ambitious work of lo-fi indie folk, exploring themes of death, nature, and transformation.",
    tracks: ["I Want Wind to Blow", "The Glow Pt. 2", "The Moon", "Headless Horseman", "You'll Be in the Air", "Map", "My Roots Are Strong and Deep", "I Am Bored", "I Felt My Size", "I Felt Your Shape", "Samurai Sword", "The Gleam"]
  },
  {
    id: "8",
    title: "Currents",
    artist: "Tame Impala",
    artistId: "8",
    year: 2015,
    coverUrl: "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=500&h=500&fit=crop",
    genres: ["Psychedelic Pop", "Neo-Psychedelia", "Synth-Pop"],
    averageRating: 4.3,
    totalRatings: 16543,
    description: "Kevin Parker's most pop-oriented work, blending psychedelia with modern electronic production.",
    tracks: ["Let It Happen", "Nangs", "The Moment", "Yes I'm Changing", "Eventually", "Gossip", "The Less I Know the Better", "Past Life", "Disciples", "Cause I'm a Man", "Reality in Motion", "Love/Paranoia", "New Person, Same Old Mistakes"]
  }
];

export const artists: Artist[] = [
  {
    id: "1",
    name: "Radiohead",
    imageUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&h=600&fit=crop",
    bio: "English rock band formed in 1985, known for pioneering alternative rock and electronic experimentation. Consistently pushing boundaries across multiple decades.",
    genres: ["Art Rock", "Alternative", "Electronic", "Experimental"],
    albums: albums.filter(a => a.artistId === "1")
  },
  {
    id: "2",
    name: "Kendrick Lamar",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    bio: "Pulitzer Prize-winning rapper and one of the most influential artists of his generation. Known for complex lyricism and socially conscious themes.",
    genres: ["Hip Hop", "Conscious Hip Hop", "Jazz Rap"],
    albums: albums.filter(a => a.artistId === "2")
  },
  {
    id: "3",
    name: "Beach House",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
    bio: "Dream pop duo from Baltimore, Maryland. Victoria Legrand and Alex Scally create lush, atmospheric soundscapes.",
    genres: ["Dream Pop", "Indie Pop", "Shoegaze"],
    albums: albums.filter(a => a.artistId === "3")
  }
];

export const reviews: Review[] = [
  {
    id: "1",
    userId: "u1",
    userName: "musiclover42",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    albumId: "1",
    rating: 5,
    text: "A truly transcendent listening experience. Every track flows perfectly into the next, creating a cohesive journey. Reckoner and Weird Fishes are absolute masterpieces. This album never gets old no matter how many times I listen to it.",
    date: "2024-02-15",
    likes: 234
  },
  {
    id: "2",
    userId: "u2",
    userName: "indieexplorer",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    albumId: "1",
    rating: 4.5,
    text: "Peak Radiohead. The perfect balance between electronic experimentation and organic instrumentation. Some tracks take a few listens to fully appreciate, but the reward is worth it.",
    date: "2024-01-28",
    likes: 156
  },
  {
    id: "3",
    userId: "u3",
    userName: "criticalears",
    userAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    albumId: "2",
    rating: 5,
    text: "Not just an album, but a cultural moment. Kendrick weaves jazz, funk, and spoken word into a powerful narrative about identity and systemic oppression. Essential listening.",
    date: "2024-03-01",
    likes: 421
  },
  {
    id: "4",
    userId: "u4",
    userName: "beatsandrhymes",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    albumId: "2",
    rating: 4.5,
    text: "Ambitious, complex, and deeply meaningful. The production is incredible - every listen reveals new details. Some tracks are challenging but that's part of its brilliance.",
    date: "2024-02-20",
    likes: 298
  }
];

export const userCollection = {
  rated: ["1", "2", "3", "6"],
  wishlist: ["4", "5"],
  owned: ["1", "2", "6"]
};
