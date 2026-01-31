import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { profileService } from "../services/profileService";

export default function Following() {
  const { username } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    profileService
      .getFollowing(username)
      .then((res) => setUsers(res.data ?? []))
      .catch(() => setError("Could not load following."))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Following</h1>
          <p className="text-sm text-gray-600">@{username}</p>
        </div>

        <Link to={`/profile/${username}`}>
          <Button variant="secondary">Back</Button>
        </Link>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
          {error}
        </div>
      )}

      <Card className="p-4">
        {users.length === 0 ? (
          <div className="text-sm text-gray-600">Not following anyone yet.</div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <Link
                key={u.id}
                to={`/profile/${u.username}`}
                className="block"
              >
                <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:bg-gray-50">
                  <div className="text-sm font-medium text-gray-900">
                    @{u.username}
                  </div>
                  <div className="text-xs text-gray-500">View</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
