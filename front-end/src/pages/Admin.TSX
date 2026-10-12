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
        { method: "GET", credentials: "include" }
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
        { method: "GET", credentials: "include" }
      );
      const data = await response.json();
      if (data.status === "success") setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchCommunities = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/admin_actions.php?action=get_communities",
        { method: "GET", credentials: "include" }
      );
      const data = await response.json();
      if (data.status === "success") setCommunities(data.communities);
    } catch (error) {
      console.error("Failed to fetch communities:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/admin_actions.php?action=get_posts",
        { method: "GET", credentials: "include" }
      );
      const data = await response.json();
      if (data.status === "success") setPosts(data.posts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/report_actions.php?action=get_reports",
        { method: "GET", credentials: "include" }
      );
      const data = await response.json();
      if (data.status === "success") setReports(data.reports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? All their data will be removed.")) return;
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
      if (data.status === "success") fetchUsers();
      else alert(data.message);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleUpdateReport = async (reportId: number, newStatus: string, notes: string = "") => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/report_actions.php?action=update_report",
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ report_id: reportId, status: newStatus, admin_notes: notes })
        }
      );
      const data = await response.json();
      if (data.status === "success") fetchReports();
      else alert(data.message);
    } catch (error) {
      console.error("Failed to update report:", error);
    }
  };

  const handleDeleteCommunity = async (communityId: number) => {
    if (!confirm("Are you sure you want to delete this community? All posts and members will be removed.")) return;
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
      if (data.status === "success") fetchCommunities();
      else alert(data.message);
    } catch (error) {
      console.error("Failed to delete community:", error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
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
      if (data.status === "success") fetchPosts();
      else alert(data.message);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs: { key: "users" | "communities" | "posts" | "reports"; label: string }[] = [
    { key: "users", label: "Users" },
    { key: "communities", label: "Communities" },
    { key: "posts", label: "Posts" },
    { key: "reports", label: "Reports" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-8 h-8 text-gray-600" />
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400 ml-11">Manage users, communities, and content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded border border-gray-300 p-5 flex items-center gap-4">
            <div className="p-2.5 rounded border border-gray-300 bg-gray-50">
              <Users className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Users</p>
              <p className="text-3xl font-bold text-gray-800">{users.length}</p>
            </div>
          </div>
          <div className="bg-white rounded border border-gray-300 p-5 flex items-center gap-4">
            <div className="p-2.5 rounded border border-gray-300 bg-gray-50">
              <Globe className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Communities</p>
              <p className="text-3xl font-bold text-gray-800">{communities.length}</p>
            </div>
          </div>
          <div className="bg-white rounded border border-gray-300 p-5 flex items-center gap-4">
            <div className="p-2.5 rounded border border-gray-300 bg-gray-50">
              <Edit className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Posts</p>
              <p className="text-3xl font-bold text-gray-800">{posts.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-0 border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === tab.key
                ? "border-gray-800 text-gray-800 bg-white"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-b border border-t-0 border-gray-300 shadow-sm">
          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Users className="w-6 h-6 text-gray-500" />
                Manage Users
              </h2>
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-300 border border-gray-400 flex items-center justify-center text-gray-700 font-bold text-base">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-800 font-bold">{user.username}</p>
                          {user.role_u === "admin" && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-bold border border-gray-400">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-300 text-xs">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role_u === "admin"}
                      className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Delete User"
                    >
                      <UserX className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Communities Tab */}
          {activeTab === "communities" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Globe className="w-6 h-6 text-gray-500" />
                Manage Communities
              </h2>
              <div className="space-y-2">
                {communities.map((community) => (
                  <div
                    key={community.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-800 font-bold">{community.com_name}</h3>
                        {community.privacy === "private" ? (
                          <Lock className="w-3.5 h-3.5 text-gray-400" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mb-2 line-clamp-1">{community.com_description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded border border-gray-300">Category: {community.category}</span>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded border border-gray-300">{community.member_count} members</span>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded border border-gray-300">By: {community.creator_username}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCommunity(community.id)}
                      className="p-2 hover:bg-gray-200 rounded transition-colors ml-4"
                      title="Delete Community"
                    >
                      <Trash2 className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Edit className="w-6 h-6 text-gray-500" />
                Manage Posts
              </h2>
              <div className="space-y-2">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="text-gray-800 font-bold mb-1">{post.title}</h3>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded border border-gray-300">By: {post.username}</span>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded border border-gray-300">In: {post.com_name}</span>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded border border-gray-300">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 hover:bg-gray-200 rounded transition-colors ml-4"
                      title="Delete Post"
                    >
                      <Trash2 className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Shield className="w-6 h-6 text-gray-500" />
                Manage Reports
              </h2>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-bold border border-gray-300">
                            Report #{report.id}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs border border-gray-300">
                            {report.reported_item_type} #{report.reported_item_id}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs border font-medium ${report.status === 'resolved'
                            ? 'bg-gray-200 text-gray-600 border-gray-400'
                            : report.status === 'under_review'
                              ? 'bg-gray-300 text-gray-700 border-gray-400'
                              : 'bg-gray-100 text-gray-500 border-gray-300'
                            }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-gray-700 font-medium text-sm mb-1">Reason: {report.reason}</p>
                        {report.description && (
                          <p className="text-gray-500 text-sm mb-2 bg-white p-3 rounded border border-gray-200">
                            {report.description}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs">Reporter: {report.reporter_username}</p>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[130px]">
                        <button
                          onClick={() => handleUpdateReport(report.id, "under_review")}
                          className="px-3 py-2 bg-gray-200 border border-gray-400 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 transition-colors"
                        >
                          Under Review
                        </button>
                        <button
                          onClick={() => handleUpdateReport(report.id, "resolved")}
                          className="px-3 py-2 bg-gray-700 text-white rounded text-xs font-medium hover:bg-gray-600 transition-colors"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleUpdateReport(report.id, "dismissed")}
                          className="px-3 py-2 bg-white border border-gray-400 text-gray-500 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
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