import { useState, useEffect } from "react";
import Post from "../components/Post";

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
      let url = "http://localhost/Interconnected/backend/api/post_actions.php?action=get_posts";
      if (communityId) {
        url += `&community_id=${communityId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        credentials: "include"
      });
      const data = await response.json();

      if (data.status === "success") {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Feed</h1>
      
      {posts.length === 0 ? (
        <div className="text-center text-slate-400 py-12">
          No posts yet. Be the first to post!
        </div>
      ) : (
        posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            currentUserId={userId}
            onUpdate={fetchPosts}
          />
        ))
      )}
    </div>
  );
};

export default Feed;