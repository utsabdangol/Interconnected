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

  const isOwner = currentUserId !== null && String(currentUserId) === String(post.user_id);

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

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost/Interconnected/backend/api/post_actions.php?action=get_comments&post_id=${post.id}`,
        { method: "GET", credentials: "include" }
      );
      const data = await response.json();
      if (data.status === "success") {
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    await fetchComments();
    setShowComments(true);
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
          body: JSON.stringify({ post_id: post.id, content: commentText })
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setCommentText("");
        await fetchComments();
        onUpdate();
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
          body: JSON.stringify({ post_id: post.id, title: editTitle, content: editContent })
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
    <div className="bg-white rounded border border-gray-300 p-6 mb-4 hover:border-gray-400 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 border border-gray-400 flex items-center justify-center text-gray-700 font-bold text-base">
            {getInitial(post.username)}
          </div>
          <div>
            <h3 className="text-gray-800 font-semibold text-base">{post.username}</h3>
            <p className="text-gray-400 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              {post.com_name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isOwner && (
            <ReportButton itemType="post" itemId={post.id} />
          )}

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded border border-gray-300 shadow-md py-1 z-10">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Post</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-gray-500 hover:bg-gray-100 flex items-center gap-3 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Post</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h2>
          <p className="text-gray-500 mb-4 leading-relaxed text-sm">{post.content}</p>

          {post.image && (
            <div className="mb-4 rounded overflow-hidden border border-gray-300">
              <img
                src={`http://localhost/Interconnected/backend/${post.image}`}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm ${isLiked
                  ? "text-gray-700 bg-gray-200 hover:bg-gray-300"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="font-medium">{likeCount}</span>
            </button>

            <button
              onClick={loadComments}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{post.comment_count}</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <form onSubmit={handleAddComment} className="mb-4">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all text-sm"
                />
              </form>

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 border border-gray-400 flex items-center justify-center text-gray-700 text-xs font-bold">
                      {getInitial(comment.username)}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded border border-gray-200 p-3">
                      <p className="text-gray-700 font-semibold text-xs mb-1">{comment.username}</p>
                      <p className="text-gray-500 text-sm">{comment.content}</p>
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