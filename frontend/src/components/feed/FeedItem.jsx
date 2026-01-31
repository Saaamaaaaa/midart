import Button from "../ui/Button";
import Card from "../ui/Card";

export default function FeedItem({ item, onLike }) {
  const imageUrl = item.profile_image || "";

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="text-[10px] text-gray-400">No</div>
          )}
        </div>

        <div className="text-sm font-medium text-gray-900">@{item.username}</div>

        <div className="ml-auto text-xs text-gray-500">
          {new Date(item.created_at).toLocaleString()}
        </div>
      </div>

      {item.post_type === "image" ? (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            <img src={item.image} alt="Post" className="w-full object-cover" />
          </div>
          {item.caption && <div className="text-sm text-gray-700">{item.caption}</div>}
        </div>
      ) : (
        <div className="text-base text-gray-900 whitespace-pre-wrap">{item.content}</div>
      )}

      <div className="flex items-center gap-2">
        <Button variant={item.is_liked ? "secondary" : "primary"} onClick={onLike}>
          {item.is_liked ? "Liked" : "Like"} · {item.like_count}
        </Button>
        <div className="text-sm text-gray-500">Comments: {item.comment_count}</div>
      </div>
    </Card>
  );
}
