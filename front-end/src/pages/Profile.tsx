import { useState, useEffect } from "react";
import { Edit, Trash2, Users, Lock, Globe, Check, X, Clock, User, XCircle } from "lucide-react";
import Post from "../components/Post";

interface ProfileProps {
  userId: string | null;
}

interface Community {
  id: number;
  com_name: string;
  category: string;
  com_description: string;
  member_count: number;
  privacy: string;
}

interface Request {
  request_id: number;
  community_id: number;
  user_id: number;
  username: string;
  com_name: string;
  joined_at: string;
}

interface UserReport {
  id: number;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_username: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  created_at: string;
  post_count: number;
  community_count: number;
  reports: UserReport[];
  report_count: number;
}

const Profile = ({ userId }: ProfileProps) => {
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingCommunity, setEditingCommunity] = useState<number | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [viewingProfile, setViewingProfile] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    com_name: "",
    category: "",
    com_description: "",
    privacy: "public"
  });

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserPosts();
      fetchUserCommunities();
      fetchRequests();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/session-check.php",
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await response.json();
      if (data.logged_in) {
        setUsername(data.user.username);
        setEmail(data.user.email || "");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(
        `http://localhost/Interconnected/backend/api/profile_actions.php?action=get_user_posts`,
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setUserPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCommunities = async () => {
    try {
      const response = await fetch(
        `http://localhost/Interconnected/backend/api/profile_actions.php?action=get_created_communities`,
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setUserCommunities(data.communities);
      }
    } catch (error) {
      console.error("Failed to fetch user communities:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/community_requests.php?action=get_requests",
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await response.json();
      
      if (data.status === "success") {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    }
  };

  const handleEditCommunity = (community: Community) => {
    setEditingCommunity(community.id);
    setEditForm({
      com_name: community.com_name,
      category: community.category,
      com_description: community.com_description,
      privacy: community.privacy
    });
  };

  const handleUpdateCommunity = async (communityId: number) => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/profile_actions.php?action=update_community",
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            community_id: communityId,
            ...editForm
          })
        }
      );
      const data = await response.json();
      
      if (data.status === "success") {
        setEditingCommunity(null);
        fetchUserCommunities();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to update community:", error);
    }
  };

  const handleDeleteCommunity = async (communityId: number) => {
    if (!confirm("Are you sure you want to delete this community? All posts and members will be removed.")) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/profile_actions.php?action=delete_community",
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ community_id: communityId })
        }
      );
      const data = await response.json();
      
      if (data.status === "success") {
        fetchUserCommunities();
        fetchUserPosts();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to delete community:", error);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    setProcessingRequestId(requestId);
    
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/community_requests.php?action=approve_request",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request_id: requestId })
        }
      );
      const data = await response.json();
      
      if (data.status === "success") {
        fetchRequests();
        fetchUserCommunities(); // Refresh to update member count
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to approve request:", error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    
    setProcessingRequestId(requestId);
    
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/community_requests.php?action=reject_request",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request_id: requestId })
        }
      );
      const data = await response.json();
      
      if (data.status === "success") {
        fetchRequests();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to reject request:", error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleViewProfile = async (userId: number) => {
    setViewingProfile(userId);
    setLoadingProfile(true);
    setUserProfile(null);
    
    try {
      const response = await fetch(
        `http://localhost/Interconnected/backend/api/profile_actions.php?action=get_user_profile&user_id=${userId}`,
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await response.json();
      
      if (data.status === "success") {
        setUserProfile(data.user);
      } else {
        alert(data.message);
        setViewingProfile(null);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      alert("Failed to load user profile");
      setViewingProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const closeProfileModal = () => {
    setViewingProfile(null);
    setUserProfile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl shadow-blue-500/30 animate-pulse-slow">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{username}</h1>
              <p className="text-slate-400 text-lg mb-4">{email}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                  <span className="text-blue-300 font-semibold">{userPosts.length}</span>
                  <span className="text-slate-400 ml-2">Posts</span>
                </div>
                <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                  <span className="text-emerald-300 font-semibold">{userCommunities.length}</span>
                  <span className="text-slate-400 ml-2">Communities</span>
                </div>
                {requests.length > 0 && (
                  <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                    <span className="text-yellow-300 font-semibold">{requests.length}</span>
                    <span className="text-slate-400 ml-2">Pending {requests.length === 1 ? 'Request' : 'Requests'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts Section - Left/Center */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                <Edit className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Your Posts</h2>
            </div>
            {userPosts.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-16 border border-blue-500/20 shadow-xl shadow-blue-500/10 text-center">
                <Edit className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300 text-xl font-semibold mb-2">No posts yet</p>
                <p className="text-slate-400">Create your first post to get started!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {userPosts.map((post, index) => (
                  <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <Post
                      post={post}
                      currentUserId={userId}
                      onUpdate={fetchUserPosts}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pending Requests Section */}
            {requests.length > 0 && (
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 shadow-xl shadow-yellow-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Pending Requests
                  </h2>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm font-bold border border-yellow-500/30">
                    {requests.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {requests.map((request, index) => (
                    <div
                      key={request.request_id}
                      className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="mb-3">
                        <p className="text-white font-bold">{request.username}</p>
                        <p className="text-slate-400 text-sm mt-1">
                          wants to join <span className="text-blue-400 font-semibold">{request.com_name}</span>
                        </p>
                        <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(request.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewProfile(request.user_id)}
                          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 font-semibold"
                          title="View Profile"
                        >
                          <User className="w-4 h-4" />
                          View Profile
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveRequest(request.request_id)}
                            disabled={processingRequestId === request.request_id}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:hover:scale-100 font-semibold"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.request_id)}
                            disabled={processingRequestId === request.request_id}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:hover:scale-100 font-semibold"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communities Section */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Your Communities</h2>
              </div>
              
              {userCommunities.length === 0 ? (
                <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-300 font-semibold">No communities yet</p>
                  <p className="text-slate-400 text-sm mt-1">Create your first community!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userCommunities.map((community, index) => (
                    <div
                      key={community.id}
                      className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-xl p-5 border border-slate-700/50 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {editingCommunity === community.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editForm.com_name}
                            onChange={(e) => setEditForm({ ...editForm, com_name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="Community Name"
                          />
                          <input
                            type="text"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="Category"
                          />
                          <textarea
                            value={editForm.com_description}
                            onChange={(e) => setEditForm({ ...editForm, com_description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-600/50 rounded-xl text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="Description"
                          />
                          <select
                            value={editForm.privacy}
                            onChange={(e) => setEditForm({ ...editForm, privacy: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateCommunity(community.id)}
                              className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20 font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCommunity(null)}
                              className="flex-1 px-4 py-2.5 bg-slate-600 text-white text-sm rounded-xl hover:bg-slate-700 transition-all duration-300 hover:scale-105 font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-bold text-white">{community.com_name}</h3>
                                {community.privacy === 'private' ? (
                                  <div className="p-1 rounded-lg bg-blue-500/20 border border-blue-500/30" title="Private Community">
                                    <Lock className="w-4 h-4 text-blue-400" />
                                  </div>
                                ) : (
                                  <div className="p-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30" title="Public Community">
                                    <Globe className="w-4 h-4 text-emerald-400" />
                                  </div>
                                )}
                              </div>
                              <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-semibold border border-blue-500/30">
                                {community.category}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCommunity(community)}
                                className="p-2 hover:bg-blue-500/20 rounded-xl transition-all duration-300 hover:scale-110 border border-blue-500/20 hover:border-blue-500/40"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteCommunity(community.id)}
                                className="p-2 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110 border border-red-500/20 hover:border-red-500/40"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-slate-300 text-sm mb-3 line-clamp-2 leading-relaxed">
                            {community.com_description}
                          </p>
                          
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50 w-fit">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span className="text-slate-300 text-sm font-semibold">{community.member_count} members</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-slate-800 via-blue-900/30 to-slate-800 rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/20 max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-500/20">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">User Profile</h2>
                <button
                  onClick={closeProfileModal}
                  className="p-2 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110 border border-red-500/30"
                >
                  <XCircle className="w-6 h-6 text-red-400" />
                </button>
              </div>

              {loadingProfile ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : userProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/30 animate-pulse-slow">
                      {userProfile.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{userProfile.username}</h3>
                      <p className="text-slate-400">{userProfile.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
                      <p className="text-slate-400 text-sm mb-2 font-semibold">Posts</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{userProfile.post_count}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-4 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300">
                      <p className="text-slate-400 text-sm mb-2 font-semibold">Communities</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">{userProfile.community_count}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-4 border border-slate-600/30 mb-4">
                    <p className="text-slate-400 text-sm mb-2 font-semibold">Member Since</p>
                    <p className="text-white text-lg">
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Reports Section */}
                  {userProfile.report_count > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <h4 className="text-lg font-bold text-white">
                          Reports ({userProfile.report_count})
                        </h4>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {userProfile.reports.map((report) => (
                          <div
                            key={report.id}
                            className="bg-gradient-to-r from-red-500/10 to-red-600/5 rounded-xl p-3 border border-red-500/30"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-red-300 font-semibold text-sm mb-1">
                                  {report.reason}
                                </p>
                                {report.description && (
                                  <p className="text-slate-300 text-xs mb-2">
                                    {report.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-slate-400">
                                    By: {report.reporter_username}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-lg ${
                                    report.status === 'resolved' 
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : report.status === 'under_review'
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  }`}>
                                    {report.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-slate-500 text-xs mt-1">
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.report_count === 0 && (
                    <div className="mb-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-xl p-3 border border-emerald-500/30">
                      <p className="text-emerald-300 text-sm font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        No reports - Clean profile
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        closeProfileModal();
                        const request = requests.find(r => r.user_id === viewingProfile);
                        if (request) {
                          handleApproveRequest(request.request_id);
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 font-semibold"
                    >
                      Approve Request
                    </button>
                    <button
                      onClick={closeProfileModal}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-500 transition-all duration-300 shadow-lg shadow-slate-500/20 hover:shadow-xl hover:shadow-slate-500/30 hover:scale-105 font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">Failed to load profile</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;