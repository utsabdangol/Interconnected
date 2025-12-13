import { useState, useEffect } from "react";
import { Users, Shield, Trash2, Edit, Lock, Globe, UserX } from "lucide-react";

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

interface Report {
  id: number;
  reported_item_type: string;
  reported_item_id: number;
  reason: string;
  description: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reporter_username: string;
  reviewed_by_username: string | null;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState<"users" | "communities" | "posts" | "reports">("users");
  const [reports, setReports] = useState<Report[]>([]);
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
      else if (activeTab === "reports") fetchReports();
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

  const fetchReports = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/report_actions.php?action=get_reports",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setReports(data.reports);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  const handleUpdateReport = async (
    reportId: number,
    newStatus: string,
    notes: string = ""
  ) => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/report_actions.php?action=update_report",
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            report_id: reportId,
            status: newStatus,
            admin_notes: notes
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        fetchReports(); // refresh list
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to update report:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 shadow-lg shadow-red-500/20">
              <Shield className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-slate-400 text-lg">Manage users, communities, and content</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 shadow-xl shadow-blue-500/10 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Total Users</p>
                <p className="text-4xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 shadow-xl shadow-emerald-500/10 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <Globe className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Total Communities</p>
                <p className="text-4xl font-bold text-white">{communities.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-xl shadow-purple-500/10 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <Edit className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Total Posts</p>
                <p className="text-4xl font-bold text-white">{posts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6 bg-slate-800/30 backdrop-blur-xl rounded-2xl p-2 border border-slate-700/50">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === "users"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("communities")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === "communities"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
          >
            Communities
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === "posts"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === "reports"
              ? "bg-red-600 text-white shadow-lg shadow-red-500/30 scale-105"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
          >
            Reports
          </button>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="p-6">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                Manage Users
              </h2>
              <div className="space-y-3">
                {users.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold text-lg">{user.username}</p>
                          {user.role_u === "admin" && (
                            <span className="px-2 py-1 bg-red-600/30 text-red-400 rounded-lg text-xs font-bold border border-red-500/30">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mt-1">{user.email}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role_u === "admin"}
                      className="p-3 hover:bg-red-600/20 rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/20 hover:border-red-500/40"
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
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Globe className="w-8 h-8 text-emerald-400" />
                Manage Communities
              </h2>
              <div className="space-y-3">
                {communities.map((community, index) => (
                  <div
                    key={community.id}
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-bold text-lg">{community.com_name}</h3>
                        {community.privacy === "private" ? (
                          <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
                            <Lock className="w-4 h-4 text-blue-400" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                            <Globe className="w-4 h-4 text-emerald-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm mb-3">{community.com_description}</p>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">Category: {community.category}</span>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">{community.member_count} members</span>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">By: {community.creator_username}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCommunity(community.id)}
                      className="p-3 hover:bg-red-600/20 rounded-xl transition-all duration-300 hover:scale-110 ml-4 border border-red-500/20 hover:border-red-500/40"
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
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Edit className="w-8 h-8 text-purple-400" />
                Manage Posts
              </h2>
              <div className="space-y-3">
                {posts.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-2">{post.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">By: {post.username}</span>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">In: {post.com_name}</span>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-3 hover:bg-red-600/20 rounded-xl transition-all duration-300 hover:scale-110 ml-4 border border-red-500/20 hover:border-red-500/40"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "reports" && (
            <div className="p-6">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-400" />
                Manage Reports
              </h2>

              <div className="space-y-4">
                {reports.map((report, index) => (
                  <div
                    key={report.id}
                    className="p-5 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700/50 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 font-bold text-sm">Report #{report.id}</span>
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 text-sm">{report.reported_item_type} #{report.reported_item_id}</span>
                        </div>
                        <p className="text-white font-semibold mb-2">Reason: {report.reason}</p>
                        {report.description && (
                          <p className="text-slate-300 text-sm mb-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            {report.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg border border-slate-600/50">Reporter: {report.reporter_username}</span>
                          <span className={`px-3 py-1 rounded-lg border ${report.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            report.status === 'under_review' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                              'bg-red-500/20 text-red-300 border-red-500/30'
                            }`}>Status: {report.status}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <button
                          onClick={() => handleUpdateReport(report.id, "under_review")}
                          className="px-4 py-2 bg-blue-600 rounded-xl text-white text-sm font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20"
                        >
                          Under Review
                        </button>

                        <button
                          onClick={() => handleUpdateReport(report.id, "resolved")}
                          className="px-4 py-2 bg-emerald-600 rounded-xl text-white text-sm font-semibold hover:bg-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/20"
                        >
                          Resolve
                        </button>

                        <button
                          onClick={() => handleUpdateReport(report.id, "dismissed")}
                          className="px-4 py-2 bg-red-600 rounded-xl text-white text-sm font-semibold hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/20"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
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