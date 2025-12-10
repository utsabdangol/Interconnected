import { useState, useEffect } from "react";
import { Users, Shield, Trash2, Edit, Lock, Globe, UserX } from "lucide-react";

interface AdminProps {
  userId: string | null;
}

interface User {
  id: number;
  username: string;
  email: string;
  role_u: string;
  created_at: string;
}

interface Community {
  id: number;
  com_name: string;
  category: string;
  com_description: string;
  privacy: string;
  member_count: number;
  creator_username: string;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  username: string;
  com_name: string;
  created_at: string;
}

const Admin = ({ userId }: AdminProps) => {
  const [activeTab, setActiveTab] = useState<"users" | "communities" | "posts">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "users") fetchUsers();
      else if (activeTab === "communities") fetchCommunities();
      else if (activeTab === "posts") fetchPosts();
    }
  }, [activeTab, isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/session-check.php",
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await response.json();
      
      if (data.logged_in && data.user.role_u === "admin") {
        setIsAdmin(true);
      } else {
        window.location.href = "/home";
      }
    } catch (error) {
      console.error("Failed to check admin status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/admin_actions.php?action=get_users",
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchCommunities = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/admin_actions.php?action=get_communities",
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setCommunities(data.communities);
      }
    } catch (error) {
      console.error("Failed to fetch communities:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/admin_actions.php?action=get_posts",
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? All their data will be removed.")) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/admin_actions.php?action=delete_user",
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId })
        }
      );
      const data = await response.json();
      
      if (data.status === "success") {
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleDeleteCommunity = async (communityId: number) => {
    if (!confirm("Are you sure you want to delete this community? All posts and members will be removed.")) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/admin_actions.php?action=delete_community",
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ community_id: communityId })
        }
      );
      const data = await response.json();
      
      if (data.status === "success") {
        fetchCommunities();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to delete community:", error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/admin_actions.php?action=delete_post",
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: postId })
        }
      );
      const data = await response.json();
      
      if (data.status === "success") {
        fetchPosts();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-red-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-400 ml-13">Manage users, communities, and content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <Users className="w-12 h-12 text-blue-400" />
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <Globe className="w-12 h-12 text-emerald-400" />
              <div>
                <p className="text-slate-400 text-sm">Total Communities</p>
                <p className="text-3xl font-bold text-white">{communities.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <Edit className="w-12 h-12 text-purple-400" />
              <div>
                <p className="text-slate-400 text-sm">Total Posts</p>
                <p className="text-3xl font-bold text-white">{posts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "users"
                ? "bg-blue-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("communities")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "communities"
                ? "bg-emerald-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Communities
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "posts"
                ? "bg-purple-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Posts
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50">
          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Manage Users</h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{user.username}</p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                        <p className="text-slate-500 text-xs">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {user.role_u === "admin" && (
                        <span className="px-2 py-1 bg-red-600/30 text-red-400 rounded-full text-xs font-semibold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role_u === "admin"}
                      className="p-2 hover:bg-red-600/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserX className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Communities Tab */}
          {activeTab === "communities" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Manage Communities</h2>
              <div className="space-y-3">
                {communities.map((community) => (
                  <div
                    key={community.id}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{community.com_name}</h3>
                        {community.privacy === "private" ? (
                          <Lock className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Globe className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{community.com_description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span>Category: {community.category}</span>
                        <span>Members: {community.member_count}</span>
                        <span>Creator: {community.creator_username}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCommunity(community.id)}
                      className="p-2 hover:bg-red-600/20 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Manage Posts</h2>
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                  >
                    <div>
                      <h3 className="text-white font-semibold">{post.title}</h3>
                      <div className="flex gap-4 mt-1 text-sm text-slate-400">
                        <span>By: {post.username}</span>
                        <span>In: {post.com_name}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 hover:bg-red-600/20 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;