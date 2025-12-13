import { useState, useEffect } from "react";
import Post from "../components/Post";
import { Rss } from "lucide-react";
import { Link } from "react-router-dom";

interface FeedProps {
  userId?: string | null;
  communityId?: number;
}

interface Community {
  id: number;
  com_name: string;
  category: string;
}

const Feed = ({ userId }: FeedProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCommunityId]);

  const fetchCommunities = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/community_actions.php?action=get_user_communities",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setCommunities(data.communities);
      }
    } catch (error) {
      console.error("Failed to load communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      let url =
        "http://localhost/Interconnected/backend/api/post_actions.php?action=get_posts";
      if (selectedCommunityId) {
        url += `&community_id=${selectedCommunityId}`;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Feed Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/20">
              <Rss className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Your Feed
              </h1>
              <p className="text-slate-400 mt-1 text-lg">
                Latest posts from your communities
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts Section - Left Side */}
          <div className="lg:col-span-2">
            {posts.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-800/60 via-blue-900/20 to-slate-800/60 backdrop-blur-xl rounded-2xl p-16 border border-blue-500/20 shadow-2xl shadow-blue-500/10 text-center hover:border-blue-500/40 transition-all duration-300">
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Rss className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-3">No Posts Yet</h3>
                <p className="text-slate-300 text-lg mb-8">
                  Join communities and start creating posts to see them here!
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    to="/home/community"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 font-semibold"
                  >
                    Browse Communities
                  </Link>
                  <Link
                    to="/home/create_community"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 font-semibold"
                  >
                    Create Community
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map(
                  (post) =>
                    post && (
                      <div key={post.id} className="animate-fade-in">
                        <Post
                          post={post}
                          currentUserId={userId || null} // Pass null if userId is undefined
                          onUpdate={fetchPosts}
                        />
                      </div>
                    )
                )}
              </div>
            )}

            {/* Load More (Optional - for future pagination) */}
            {posts.length >= 50 && (
              <div className="mt-8 text-center">
                <button className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-500 transition-all duration-300 shadow-lg shadow-slate-500/20 hover:shadow-xl hover:shadow-slate-500/30 hover:scale-105 font-semibold">
                  Load More Posts
                </button>
              </div>
            )}
          </div>

          {/* Community Filter - Right Side */}
          {communities.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-slate-800/60 via-blue-900/20 to-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-blue-500/20 shadow-2xl shadow-blue-500/10 sticky top-6 hover:border-blue-500/40 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-emerald-400"></div>
                  <p className="text-slate-200 text-sm font-bold uppercase tracking-wider">Filter by community</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedCommunityId(null)}
                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-left ${selectedCommunityId === null
                      ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:scale-105 border border-slate-600/50"
                      }`}
                  >
                    All Communities
                  </button>
                  {communities.map((community) => (
                    <button
                      key={community.id}
                      onClick={() => setSelectedCommunityId(community.id)}
                      className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-left ${selectedCommunityId === community.id
                        ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:scale-105 border border-slate-600/50"
                        }`}
                    >
                      {community.com_name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
