import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { profileService } from "../services/profileService";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [followBusy, setFollowBusy] = useState(false);

  const [tab, setTab] = useState("posts"); // "posts" | "projects"
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  function loadProfile() {
    setLoading(true);
    setError("");

    profileService
      .getByUsername(username)
      .then((res) => setProfile(res.data))
      .catch(() => {
        setError("User not found");
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }

  async function loadTabData(nextTab) {
    setTabLoading(true);
    try {
      if (nextTab === "posts") {
        const res = await profileService.getPosts(username);
        setPosts(res.data ?? []);
      } else {
        const res = await profileService.getProjects(username);
        setProjects(res.data ?? []);
      }
    } finally {
      setTabLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    loadTabData("posts");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  async function handleFollowToggle() {
    if (!profile || followBusy) return;

    setFollowBusy(true);
    try {
      if (profile.is_following) {
        await profileService.unfollow(username);
      } else {
        await profileService.follow(username);
      }
      loadProfile();
    } catch {
      alert("Follow action failed. Please try again.");
    } finally {
      setFollowBusy(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  const isYou = currentUser?.username === username;
  const imageUrl = profile?.profile_image || "";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-gray-400">No photo</div>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">
              @{profile?.username} {isYou && "(you)"}
            </h1>

            {profile?.bio && <p className="text-sm text-gray-600">{profile.bio}</p>}

            <div className="flex gap-4 pt-2">
              <Link to={`/profile/${username}/followers`} className="text-sm text-gray-700 hover:underline">
                <span className="font-medium">{profile.follower_count}</span> followers
              </Link>
              <Link to={`/profile/${username}/following`} className="text-sm text-gray-700 hover:underline">
                <span className="font-medium">{profile.following_count}</span> following
              </Link>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isYou ? (
            <>
              <Link to={`/profile/${username}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Link to="/projects/create">
                <Button>Create project</Button>
              </Link>
            </>
          ) : (
            <Button
              variant={profile.is_following ? "secondary" : "primary"}
              onClick={handleFollowToggle}
              disabled={followBusy}
            >
              {followBusy ? "Working…" : profile.is_following ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={tab === "posts" ? "primary" : "secondary"}
          onClick={() => {
            setTab("posts");
            loadTabData("posts");
          }}
        >
          Posts
        </Button>
        <Button
          type="button"
          variant={tab === "projects" ? "primary" : "secondary"}
          onClick={() => {
            setTab("projects");
            loadTabData("projects");
          }}
        >
          Projects
        </Button>
      </div>

      {/* Tab content */}
      {tabLoading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : tab === "posts" ? (
        posts.length === 0 ? (
          <Card className="p-5">
            <div className="text-sm text-gray-700">No posts yet.</div>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <Card key={`${p.post_type}-${p.id}`} className="p-4 space-y-2">
                <div className="text-xs text-gray-500">
                  {p.post_type} · {new Date(p.created_at).toLocaleString()}
                </div>
                {p.post_type === "image" ? (
                  <>
                    <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                      <img src={p.image} alt="Post" className="w-full object-cover" />
                    </div>
                    {p.caption && <div className="text-sm text-gray-800">{p.caption}</div>}
                  </>
                ) : (
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">{p.content}</div>
                )}
              </Card>
            ))}
          </div>
        )
      ) : projects.length === 0 ? (
        <Card className="p-5">
          <div className="text-sm text-gray-700">No projects yet.</div>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((proj) => (
            <Link key={proj.id} to={`/projects/${proj.id}`} className="block">
              <Card className="p-4 hover:bg-gray-50">
                <div className="text-sm font-medium text-gray-900">{proj.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {proj.status} · {proj.project_type}
                  {proj.progress_percent != null ? ` · ${proj.progress_percent}%` : ""}
                </div>
                <div className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {proj.description}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
