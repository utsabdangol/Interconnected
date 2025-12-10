import { useState, useEffect } from "react";
import { Edit, Trash2, Users, Lock, Globe, Check, X, Clock } from "lucide-react";
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

const Profile = ({ userId }: ProfileProps) => {
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingCommunity, setEditingCommunity] = useState<number | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white text-4xl font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{username}</h1>
              <p className="text-slate-400">{email}</p>
              <div className="flex gap-4 mt-3">
                <span className="text-slate-300">
                  <strong>{userPosts.length}</strong> Posts
                </span>
                <span className="text-slate-300">
                  <strong>{userCommunities.length}</strong> Communities Created
                </span>
                {requests.length > 0 && (
                  <span className="text-yellow-400">
                    <strong>{requests.length}</strong> Pending {requests.length === 1 ? 'Request' : 'Requests'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts Section - Left/Center */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Your Posts</h2>
            {userPosts.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-12 border border-slate-700/50 text-center">
                <p className="text-slate-400 text-lg">No posts yet. Create your first post!</p>
              </div>
            ) : (
              userPosts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  currentUserId={userId}
                  onUpdate={fetchUserPosts}
                />
              ))
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pending Requests Section */}
            {requests.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-yellow-400" />
                  Pending Requests
                  <span className="text-sm bg-yellow-600/30 text-yellow-400 px-2 py-1 rounded-full">
                    {requests.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div
                      key={request.request_id}
                      className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50"
                    >
                      <div className="mb-3">
                        <p className="text-white font-semibold">{request.username}</p>
                        <p className="text-slate-400 text-sm">
                          wants to join <span className="text-blue-400">{request.com_name}</span>
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(request.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveRequest(request.request_id)}
                          disabled={processingRequestId === request.request_id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.request_id)}
                          disabled={processingRequestId === request.request_id}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communities Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Your Communities</h2>
              
              {userCommunities.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 text-center">
                  <p className="text-slate-400">You haven't created any communities yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userCommunities.map((community) => (
                    <div
                      key={community.id}
                      className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-5 border border-slate-700/50"
                    >
                      {editingCommunity === community.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editForm.com_name}
                            onChange={(e) => setEditForm({ ...editForm, com_name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                            placeholder="Community Name"
                          />
                          <input
                            type="text"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                            placeholder="Category"
                          />
                          <textarea
                            value={editForm.com_description}
                            onChange={(e) => setEditForm({ ...editForm, com_description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm resize-none"
                            placeholder="Description"
                          />
                          <select
                            value={editForm.privacy}
                            onChange={(e) => setEditForm({ ...editForm, privacy: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateCommunity(community.id)}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCommunity(null)}
                              className="flex-1 px-3 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-white">{community.com_name}</h3>
                                {community.privacy === 'private' ? (
                                <div title="Private Community">
                                 <Lock className="w-5 h-5 text-blue-400" />
                                 </div>
                                    ) : (
                                <div title="Public Community">
                                <Globe className="w-5 h-5 text-emerald-400" />
                                </div>
                                )}
                              </div>
                              <span className="inline-block px-2 py-1 bg-blue-600/30 text-blue-400 rounded-full text-xs">
                                {community.category}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCommunity(community)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteCommunity(community.id)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                            {community.com_description}
                          </p>
                          
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Users className="w-4 h-4" />
                            <span>{community.member_count} members</span>
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
    </div>
  );
};

export default Profile;