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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full h-12 w-12 border-2 border-gray-400 border-t-transparent animate-spin"></div>
          <div className="text-gray-500 text-base font-medium">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Feed Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded border-2 border-gray-400 bg-white">
              <Rss className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                Your Feed
              </h1>
              <p className="text-gray-400 mt-1 text-base">
                Latest posts from your communities
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts Section - Left Side */}
          <div className="lg:col-span-2">
            {posts.length === 0 ? (
              <div className="bg-white rounded border-2 border-dashed border-gray-300 p-16 text-center">
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50">
                  <Rss className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-3">No Posts Yet</h3>
                <p className="text-gray-400 text-base mb-8">
                  Join communities and start creating posts to see them here!
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    to="/home/community"
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded border border-gray-400 hover:bg-gray-300 font-medium transition-colors"
                  >
                    Browse Communities
                  </Link>
                  <Link
                    to="/home/create_community"
                    className="px-6 py-3 bg-gray-700 text-white rounded border border-gray-700 hover:bg-gray-600 font-medium transition-colors"
                  >
                    Create Community
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(
                  (post) =>
                    post && (
                      <div key={post.id}>
                        <Post
                          post={post}
                          currentUserId={userId || null}
                          onUpdate={fetchPosts}
                        />
                      </div>
                    )
                )}
              </div>
            )}

            {/* Load More */}
            {posts.length >= 50 && (
              <div className="mt-8 text-center">
                <button className="px-8 py-3 bg-white text-gray-600 rounded border border-gray-400 hover:bg-gray-100 font-medium transition-colors">
                  Load More Posts
                </button>
              </div>
            )}
          </div>

          {/* Community Filter - Right Side */}
          {communities.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded border border-gray-300 p-5 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Filter by community</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedCommunityId(null)}
                    className={`w-full px-4 py-2 rounded text-sm font-medium text-left transition-colors ${selectedCommunityId === null
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                      }`}
                  >
                    All Communities
                  </button>
                  {communities.map((community) => (
                    <button
                      key={community.id}
                      onClick={() => setSelectedCommunityId(community.id)}
                      className={`w-full px-4 py-2 rounded text-sm font-medium text-left transition-colors ${selectedCommunityId === community.id
                          ? "bg-gray-700 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
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
