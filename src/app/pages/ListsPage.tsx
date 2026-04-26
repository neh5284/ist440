import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ListMusic, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createList, deleteList, getCurrentUserLists, MusicList } from "../lib/lists";
import { useAuth } from "../contexts/AuthContext";

export function ListsPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<MusicList[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const loadLists = async () => {
    setLoading(true);
    const data = await getCurrentUserLists();
    setLists(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadLists();
    else setLoading(false);
  }, [user]);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Enter a list title first.");
      return;
    }

    try {
      setCreating(true);
      const newList = await createList(title, description);
      setLists((prev) => [newList, ...prev]);
      setTitle("");
      setDescription("");
      toast.success("List created.");
    } catch (error) {
      console.error(error);
      toast.error("Could not create list.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (listId: string) => {
    if (!confirm("Delete this list? Albums will not be deleted, only removed from the list.")) return;

    try {
      await deleteList(listId);
      setLists((prev) => prev.filter((list) => list.id !== listId));
      toast.success("List deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete list.");
    }
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-10 text-center">
          <ListMusic className="w-14 h-14 text-violet-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Sign in to create lists</h1>
          <p className="text-neutral-400">
            Lists let you organize albums into custom groups like favorites, yearly rankings, or albums to revisit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ListMusic className="w-8 h-8 text-violet-500" />
          <h1 className="text-4xl font-bold text-white">My Lists</h1>
        </div>
        <p className="text-neutral-400">
          Create custom album lists like “Favorite Albums,” “Albums to Listen To,” or “Best of 2024.”
        </p>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-4">Create a List</h2>

          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="List title"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={4}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />

            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              Create List
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your Lists ({lists.length})</h2>

          {loading ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-10 text-center text-neutral-400">
              Loading lists...
            </div>
          ) : lists.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-10 text-center">
              <ListMusic className="w-14 h-14 text-neutral-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No lists yet</h3>
              <p className="text-neutral-400">Create your first list, then add albums from album pages.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-violet-500 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/lists/${list.id}`} className="block flex-1">
                      <h3 className="text-xl font-bold text-white hover:text-violet-400 transition-colors">
                        {list.title}
                      </h3>

                      {list.description && (
                        <p className="text-neutral-400 text-sm mt-2 line-clamp-2">
                          {list.description}
                        </p>
                      )}

                      <p className="text-sm text-neutral-500 mt-4">
                        {list.itemCount ?? 0} albums
                      </p>
                    </Link>

                    <button
                      onClick={() => handleDelete(list.id)}
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg"
                      title="Delete list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}