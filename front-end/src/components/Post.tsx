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

  const fetchComments = async () => {
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
          body: JSON.stringify({
            post_id: post.id,
            content: commentText
          })
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setCommentText("");
        // Refresh comments without closing the section
        await fetchComments();
        // Also update the comment count by calling onUpdate to refresh the post
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
    <div className="bg-gradient-to-br from-slate-800/60 via-blue-900/20 to-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 shadow-xl shadow-blue-500/10 mb-6 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
            {getInitial(post.username)}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{post.username}</h3>
            <p className="text-blue-400 text-sm font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {post.com_name}
            </p>
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
              <div className="absolute right-0 mt-2 w-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl shadow-blue-500/20 py-2 z-10 border border-blue-500/20 animate-scale-in">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-blue-500/20 flex items-center gap-2 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 flex items-center gap-2 transition-all duration-300"
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
          <h2 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{post.title}</h2>
          <p className="text-slate-300 mb-4 leading-relaxed">{post.content}</p>

          {post.image && (
            <div className="mb-4 rounded-xl overflow-hidden border border-blue-500/20 shadow-lg">
              <img
                src={`http://localhost/Interconnected/backend/${post.image}`}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 pt-4 border-t border-blue-500/20">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                isLiked 
                  ? "text-red-500 bg-red-500/20 hover:bg-red-500/30" 
                  : "text-slate-400 hover:text-red-500 hover:bg-red-500/10"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current animate-pulse" : ""}`} />
              <span className="font-semibold">{likeCount}</span>
            </button>

            <button
              onClick={loadComments}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{post.comment_count}</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-blue-500/20">
              <form onSubmit={handleAddComment} className="mb-4">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-3 bg-gradient-to-r from-slate-900/50 to-blue-900/20 border border-blue-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
              </form>

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 animate-fade-in">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/30">
                      {getInitial(comment.username)}
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-slate-900/50 to-blue-900/20 rounded-xl p-3 border border-blue-500/20">
                      <p className="text-white font-semibold text-sm mb-1">{comment.username}</p>
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