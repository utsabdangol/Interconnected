import { useState } from "react";
import { Heart, MessageCircle, MoreVertical, Trash2, Edit } from "lucide-react";
import ReportButton from "./ReportButton";

interface PostProps {
  post: {
    id: number;
    user_id: number;
    username: string;
    com_name: string;
    title: string;
    content: string;
    image: string | null;
    like_count: number;
    comment_count: number;
    user_liked: number;
    created_at: string;
  };
  currentUserId: string | null;
  onUpdate: () => void;
}

const Post = ({ post, currentUserId, onUpdate }: PostProps) => {
  const [isLiked, setIsLiked] = useState(post.user_liked === 1);
  const [likeCount, setLikeCount] = useState(parseInt(post.like_count.toString()));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);

  const isOwner = currentUserId === post.user_id.toString();

  const handleLike = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/post_actions.php?action=toggle_like",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: post.id })
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setIsLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost/Interconnected/backend/api/post_actions.php?action=get_comments&post_id=${post.id}`,
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setComments(data.comments);
        setShowComments(true);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/post_actions.php?action=add_comment",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: post.id,
            content: commentText
          })
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setCommentText("");
        loadComments();
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/post_actions.php?action=delete_post",
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: post.id })
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        onUpdate();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/post_actions.php?action=update_post",
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: post.id,
            title: editTitle,
            content: editContent
          })
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setIsEditing(false);
        onUpdate();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
            {getInitial(post.username)}
          </div>
          <div>
            <h3 className="text-white font-semibold">{post.username}</h3>
            <p className="text-slate-400 text-sm">{post.com_name}</p>
          </div>
        </div>
        <div className="flex items-start justify-between mb-4">
  <div className="flex items-center gap-3">
    {/* ... existing profile picture and username ... */}
  </div>

  <div className="flex gap-2">
    {!isOwner && (
      <ReportButton itemType="post" itemId={post.id} />
    )}
    
    {isOwner && (
      <button onClick={() => setShowMenu(!showMenu)}>
        <MoreVertical className="w-5 h-5 text-slate-400" />
      </button>
    )}
  </div>
</div>
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-slate-700 rounded-lg shadow-lg py-2 z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
          <p className="text-slate-300 mb-4">{post.content}</p>

          {post.image && (
            <img
              src={`http://localhost/Interconnected/backend/${post.image}`}
              alt={post.title}
              className="w-full rounded-lg mb-4"
            />
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 pt-4 border-t border-slate-700">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition ${
                isLiked ? "text-red-500" : "text-slate-400 hover:text-red-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={loadComments}
              className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.comment_count}</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <form onSubmit={handleAddComment} className="mb-4">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                />
              </form>

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {getInitial(comment.username)}
                    </div>
                    <div className="flex-1 bg-slate-900/30 rounded-lg p-3">
                      <p className="text-white font-semibold text-sm">{comment.username}</p>
                      <p className="text-slate-300 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Post;