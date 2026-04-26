import { useEffect, useState } from "react";
import { ListPlus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { addAlbumToList, createList, getCurrentUserLists, MusicList } from "../lib/lists";
import { supabase } from "../lib/supabase";

interface AddToListModalProps {
  albumId: string;
  albumTitle: string;
}

export function AddToListModal({ albumId, albumTitle }: AddToListModalProps) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<MusicList[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const loadLists = async () => {
    const userResult = await supabase.auth.getUser();

    if (!userResult.data.user) {
      toast.error("Sign in to add albums to lists.");
      setOpen(false);
      return;
    }

    setLoading(true);
    const userLists = await getCurrentUserLists();
    setLists(userLists);
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadLists();
  }, [open]);

  const handleCreateList = async () => {
    if (!newTitle.trim()) {
      toast.error("Enter a list title first.");
      return;
    }

    try {
      setLoading(true);
      const list = await createList(newTitle, newDescription);
      await addAlbumToList(list.id, albumId);
      setLists((prev) => [{ ...list, itemCount: 1 }, ...prev]);
      setNewTitle("");
      setNewDescription("");
      toast.success(`Created list and added ${albumTitle}.`);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Could not create list.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (listId: string, listTitle: string) => {
    try {
      setLoading(true);
      await addAlbumToList(listId, albumId);
      toast.success(`Added ${albumTitle} to ${listTitle}.`);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Could not add album to list.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
      >
        <ListPlus className="w-4 h-4" />
        Add to List
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <div>
                <h2 className="text-xl font-bold text-white">Add to List</h2>
                <p className="text-sm text-neutral-400">Choose a list for “{albumTitle}”.</p>
              </div>

              <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Your Lists</h3>

                {loading && <p className="text-neutral-400 text-sm">Loading...</p>}

                {!loading && lists.length === 0 && (
                  <p className="text-neutral-400 text-sm">
                    You do not have any lists yet. Create one below.
                  </p>
                )}

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleAddToList(list.id, list.title)}
                      className="w-full text-left p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors"
                    >
                      <p className="text-white font-semibold">{list.title}</p>
                      {list.description && (
                        <p className="text-sm text-neutral-400 line-clamp-1">
                          {list.description}
                        </p>
                      )}
                      <p className="text-xs text-neutral-500 mt-1">
                        {list.itemCount ?? 0} albums
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-5">
                <h3 className="text-sm font-semibold text-white mb-3">Create New List</h3>

                <div className="space-y-3">
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="List title, like My Top Albums"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />

                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Short description (optional)"
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />

                  <button
                    onClick={handleCreateList}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-950 font-semibold rounded-lg hover:bg-white disabled:opacity-60"
                  >
                    <Plus className="w-4 h-4" />
                    Create List + Add Album
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}