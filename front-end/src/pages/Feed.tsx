import { useState, useEffect } from "react";
import Post from "../components/Post";
import { Rss } from "lucide-react";
import { Link } from "react-router-dom";
interface FeedProps {
  userId: string | null;
  communityId?: number;
}

const Feed = ({ userId, communityId }: FeedProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [communityId]);

  const fetchPosts = async () => {
    try {
      let url =
        "http://localhost/Interconnected/backend/api/post_actions.php?action=get_posts";
      if (communityId) {
        url += `&community_id=${communityId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (data.status === "success") {
        setPosts(Array.isArray(data.posts) ? data.posts : []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-white text-xl">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Feed Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Rss className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Your Feed
            </h1>
          </div>
          <p className="text-slate-400 ml-11">
            Latest posts from your communities
          </p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-16 border border-slate-700/50 text-center">
            <Rss className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Posts Yet</h3>
            <p className="text-slate-400 text-lg mb-6">
              Join communities and start creating posts to see them here!
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/home"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Link to="/home/community" className="hover:text-emerald-400 transition">Community</Link>
              </a>
              <a
                href="/home/create-post"
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                <Link to="/home/create_community" className="hover:text-emerald-400 transition">Create Community</Link>
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(
              (post) =>
                post && (
                  <Post
                    key={post.id}
                    post={post}
                    currentUserId={userId}
                    onUpdate={fetchPosts}
                  />
                )
            )}
          </div>
        )}

        {/* Load More (Optional - for future pagination) */}
        {posts.length >= 50 && (
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition">
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
