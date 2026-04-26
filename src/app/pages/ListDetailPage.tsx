import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ListMusic, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlbumCard } from "../components/AlbumCard";
import { getAlbumsInList, getListById, ListAlbum, MusicList, removeAlbumFromList } from "../lib/lists";

export function ListDetailPage() {
  const { id } = useParams();
  const [list, setList] = useState<MusicList | null>(null);
  const [albums, setAlbums] = useState<ListAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  const loadList = async () => {
    if (!id) return;

    setLoading(true);
    const [listData, albumData] = await Promise.all([
      getListById(id),
      getAlbumsInList(id),
    ]);
    setList(listData);
    setAlbums(albumData);
    setLoading(false);
  };

  useEffect(() => {
    loadList();
  }, [id]);

  const handleRemoveAlbum = async (listItemId?: string) => {
    if (!listItemId) return;
    if (!confirm("Remove this album from the list?")) return;

    try {
      await removeAlbumFromList(listItemId);
      setAlbums((prev) => prev.filter((album) => album.listItemId !== listItemId));
      toast.success("Album removed from list.");
    } catch (error) {
      console.error(error);
      toast.error("Could not remove album.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-neutral-400">Loading list...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">List not found</h1>
          <Link to="/lists" className="text-violet-400 hover:text-violet-300">
            Back to lists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/lists" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-6">
        <ArrowLeft className="w-5 h-5" />
        Back to Lists
      </Link>

      <div className="mb-8 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <ListMusic className="w-7 h-7 text-white" />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{list.title}</h1>
            {list.description && <p className="text-neutral-400 mb-3">{list.description}</p>}
            <p className="text-sm text-neutral-500">{albums.length} albums</p>
          </div>
        </div>
      </div>

      {albums.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <ListMusic className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">This list is empty</h3>
          <p className="text-neutral-400 mb-6">Go to an album page and click “Add to List.”</p>
          <Link to="/" className="inline-flex px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700">
            Browse Albums
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {albums.map((album) => (
            <div key={album.listItemId || album.id} className="relative group">
              <AlbumCard album={album} />

              <button
                onClick={() => handleRemoveAlbum(album.listItemId)}
                className="absolute top-2 right-2 p-2 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                title="Remove from list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}