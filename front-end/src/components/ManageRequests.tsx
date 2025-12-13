import { useState, useEffect } from "react";
import { Check, X, Clock, User, XCircle } from "lucide-react";

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

const ManageRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [viewingProfile, setViewingProfile] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setProcessingId(requestId);

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
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to approve request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!confirm("Are you sure you want to reject this request?")) return;

    setProcessingId(requestId);

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
      setProcessingId(null);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Manage Join Requests
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto rounded-full"></div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/60 via-blue-900/20 to-slate-800/60 backdrop-blur-xl rounded-2xl p-16 border border-blue-500/20 shadow-2xl shadow-blue-500/10 text-center hover:border-blue-500/40 transition-all duration-300">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Clock className="w-12 h-12 text-blue-400" />
            </div>
            <p className="text-slate-300 text-xl font-semibold">No pending requests</p>
            <p className="text-slate-400 mt-2">All requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <div
                key={request.request_id}
                className="bg-gradient-to-br from-slate-800/60 via-blue-900/20 to-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 shadow-xl shadow-blue-500/10 flex items-center justify-between hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                      {request.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {request.username}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        wants to join <span className="text-blue-400 font-semibold">{request.com_name}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs ml-15 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Requested {new Date(request.joined_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewProfile(request.user_id)}
                    className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-110"
                    title="View Profile"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleApprove(request.request_id)}
                    disabled={processingId === request.request_id}
                    className="p-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Approve"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleReject(request.request_id)}
                    disabled={processingId === request.request_id}
                    className="p-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Reject"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
                                  <span className={`px-2 py-0.5 rounded-lg ${report.status === 'resolved'
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
                          handleApprove(request.request_id);
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

export default ManageRequests;