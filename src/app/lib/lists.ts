import { supabase } from "./supabase";

export interface MusicList {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  createdAt: string;
  itemCount?: number;
}

export interface ListAlbum {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  coverUrl?: string;
  listItemId?: string;
}

function mapList(row: any): MusicList {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    createdAt: row.created_at,
    itemCount: row.list_items?.length ?? row.item_count ?? 0,
  };
}

function mapAlbum(row: any, listItemId?: string): ListAlbum {
  return {
    id: row.id,
    title: row.title,
    artist: row.artists?.name || "Unknown Artist",
    year: row.release_year,
    genre: row.artists?.genre || "Unknown Genre",
    coverUrl: row.cover_url,
    listItemId,
  };
}

export async function getCurrentUserLists(): Promise<MusicList[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("lists")
    .select("*, list_items(id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading lists:", error);
    return [];
  }

  return (data ?? []).map(mapList);
}

export async function getListById(listId: string): Promise<MusicList | null> {
  const { data, error } = await supabase
    .from("lists")
    .select("*, list_items(id)")
    .eq("id", listId)
    .single();

  if (error) {
    console.error("Error loading list:", error);
    return null;
  }

  return mapList(data);
}

export async function createList(title: string, description = ""): Promise<MusicList> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to create lists.");
  }

  const { data, error } = await supabase
    .from("lists")
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
    })
    .select("*, list_items(id)")
    .single();

  if (error) {
    console.error("Error creating list:", error);
    throw error;
  }

  return mapList(data);
}

export async function deleteList(listId: string): Promise<void> {
  const { error } = await supabase.from("lists").delete().eq("id", listId);

  if (error) {
    console.error("Error deleting list:", error);
    throw error;
  }
}

export async function addAlbumToList(listId: string, albumId: string): Promise<void> {
  const { error } = await supabase
    .from("list_items")
    .upsert(
      {
        list_id: listId,
        album_id: albumId,
      },
      { onConflict: "list_id,album_id" }
    );

  if (error) {
    console.error("Error adding album to list:", error);
    throw error;
  }
}

export async function removeAlbumFromList(listItemId: string): Promise<void> {
  const { error } = await supabase.from("list_items").delete().eq("id", listItemId);

  if (error) {
    console.error("Error removing album from list:", error);
    throw error;
  }
}

export async function getAlbumsInList(listId: string): Promise<ListAlbum[]> {
  const { data, error } = await supabase
    .from("list_items")
    .select(`
      id,
      albums (
        id,
        title,
        release_year,
        cover_url,
        artists (
          name,
          genre
        )
      )
    `)
    .eq("list_id", listId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading list albums:", error);
    return [];
  }

  return (data ?? [])
    .filter((item: any) => item.albums)
    .map((item: any) => mapAlbum(item.albums, item.id));
}