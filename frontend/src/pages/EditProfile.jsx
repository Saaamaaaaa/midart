import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";

export default function EditProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const isYou = useMemo(
    () => currentUser?.username === username,
    [currentUser, username]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [bio, setBio] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreviewUrl, setNewImagePreviewUrl] = useState("");

  // Load existing profile info (prefill)
  useEffect(() => {
    setLoading(true);
    setError("");
    setSuccess("");

    // If user tries to edit someone else (extra safety)
    if (currentUser && !isYou) {
      setLoading(false);
      setError("You can only edit your own profile.");
      return;
    }

    profileService
      .getByUsername(username)
      .then((res) => {
        // Based on what we just fixed: profile likely has keys like { bio, profile_image, user: {...} }
        const data = res.data ?? {};
        setBio(data.bio ?? "");
        setCurrentImageUrl(data.profile_image ?? "");
      })
      .catch(() => {
        setError("Could not load your profile data.");
      })
      .finally(() => setLoading(false));
  }, [username, currentUser, isYou]);

  // When user selects a new image: make a local preview URL
  useEffect(() => {
    if (!newImageFile) {
      setNewImagePreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(newImageFile);
    setNewImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [newImageFile]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      // Send bio even if empty (your backend will handle it)
      formData.append("bio", bio);

      // Only send image if user picked one
      if (newImageFile) {
        // This name must match your Django serializer field
        formData.append("profile_image", newImageFile);
      }

      await profileService.updateCurrent(formData);

      setSuccess("Saved ✓");

      // Optional: go back automatically after a short moment
      // If you prefer to stay on the page, remove the timeout block
      setTimeout(() => {
        navigate(`/profile/${username}`);
      }, 650);
    } catch (err) {
      // If Django returns useful errors, you can inspect err.response.data later
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Edit profile</h1>
          <p className="text-sm text-gray-600 mt-1">@{username}</p>
        </div>

        <Link to={`/profile/${username}`}>
          <Button variant="secondary" type="button">
            Back
          </Button>
        </Link>
      </div>

      {!isYou && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
          You can only edit your own profile.
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">
          {success}
        </div>
      )}

      <Card className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Current / New image preview */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              Profile image
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                {newImagePreviewUrl ? (
                  <img
                    src={newImagePreviewUrl}
                    alt="New profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt="Current profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xs text-gray-400">No photo</div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImageFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-700"
                  disabled={!isYou || saving}
                />

                {newImageFile && (
                  <button
                    type="button"
                    onClick={() => setNewImageFile(null)}
                    className="text-xs text-gray-600 underline"
                    disabled={saving}
                  >
                    Remove selected image
                  </button>
                )}

                <div className="text-xs text-gray-500">
                  If you don’t select a new image, your current one stays.
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Bio</label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              maxLength={280}
              placeholder="Who are you? verbalise it here."
              className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
              disabled={!isYou || saving}
            />

            <div className="text-xs text-gray-500">{bio.length}/280</div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={!isYou || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>

            <Link to={`/profile/${username}`}>
              <Button type="button" variant="secondary" disabled={saving}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
