import { useEffect, useState, useRef, useCallback } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FeedItem from "../components/feed/FeedItem";
import { feedService } from "../services/feedService";
import { postService } from "../services/postService";

export default function Feed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Create post UI state
  const [mode, setMode] = useState("image"); // "image" | "verbalise"
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [verbal, setVerbal] = useState("");

  // Use ref to track current request and allow cancellation
  const abortControllerRef = useRef(null);

  const loadFeed = useCallback(() => {
    // Cancel any in-flight request to prevent race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError("");

    feedService
      .getFeed({ signal: controller.signal })
      .then((res) => {
        // Only update state if this request wasn't cancelled
        if (!controller.signal.aborted) {
          setItems(res.data ?? []);
        }
      })
      .catch((err) => {
        // Ignore abort errors
        if (err.name !== 'CanceledError' && !controller.signal.aborted) {
          setError("Could not load feed.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    loadFeed();

    // Cleanup: cancel request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadFeed]);

  async function handleCreate(e) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      if (mode === "image") {
        if (!imageFile) {
          setError("Please choose an image.");
          return;
        }
        const fd = new FormData();
        fd.append("image", imageFile);
        fd.append("caption", caption);
        await postService.createImagePost(fd);
        setCaption("");
        setImageFile(null);
      } else {
        if (!verbal.trim()) {
          setError("Write something first.");
          return;
        }
        await postService.createVerbalise(verbal.trim());
        setVerbal("");
      }

      loadFeed();
    } catch {
      setError("Post failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLike(item) {
    try {
      await postService.toggleLike(item);
      loadFeed();
    } catch {
      alert("Like failed.");
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Feed</h1>
        <p className="text-sm text-gray-600 mt-1">
          Image posts + Verbalise, from people you follow (and you).
        </p>
      </div>

      {/* Create Post */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={mode === "image" ? "primary" : "secondary"}
            onClick={() => setMode("image")}
          >
            Image
          </Button>
          <Button
            type="button"
            variant={mode === "verbalise" ? "primary" : "secondary"}
            onClick={() => setMode("verbalise")}
          >
            Verbalise
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-3">
          {mode === "image" ? (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200"
                rows={3}
                placeholder="Caption (optional)"
              />
            </>
          ) : (
            <>
              <textarea
                value={verbal}
                onChange={(e) => setVerbal(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200"
                rows={4}
                maxLength={280}
                placeholder="Verbalise it. 280 characters max."
              />
              <div className="text-xs text-gray-500">{verbal.length}/280</div>
            </>
          )}

          <Button type="submit" disabled={busy}>
            {busy ? "Posting…" : "Post"}
          </Button>
        </form>
      </Card>

      {/* Feed list */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : items.length === 0 ? (
        <Card className="p-5">
          <div className="text-sm text-gray-700">
            Your feed is empty. Follow someone or post something.
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <FeedItem key={`${item.post_type}-${item.id}`} item={item} onLike={() => handleLike(item)} />
          ))}
        </div>
      )}
    </div>
  );
}
