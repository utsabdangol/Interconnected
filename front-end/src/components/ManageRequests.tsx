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
        { method: "GET", credentials: "include" }
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
        { method: "GET", credentials: "include" }
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Manage Join Requests</h1>
          <div className="w-24 h-0.5 bg-gray-300 mx-auto"></div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg font-medium">No pending requests</p>
            <p className="text-gray-400 mt-2 text-sm">All requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.request_id}
                className="bg-white rounded border border-gray-300 p-5 flex items-center justify-between hover:border-gray-400 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-300 border border-gray-400 flex items-center justify-center text-gray-700 font-bold text-sm">
                      {request.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800">
                        {request.username}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        wants to join <span className="text-gray-600 font-medium">{request.com_name}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs flex items-center gap-1 ml-13">
                    <Clock className="w-3 h-3" />
                    Requested {new Date(request.joined_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewProfile(request.user_id)}
                    className="p-2.5 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                    title="View Profile"
                  >
                    <User className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleApprove(request.request_id)}
                    disabled={processingId === request.request_id}
                    className="p-2.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(request.request_id)}
                    disabled={processingId === request.request_id}
                    className="p-2.5 bg-white border border-gray-400 text-gray-500 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded border border-gray-300 shadow-md max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
                <button
                  onClick={closeProfileModal}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {loadingProfile ? (
                <div className="flex items-center justify-center py-12">
                  <div className="rounded-full h-10 w-10 border-2 border-gray-400 border-t-transparent animate-spin"></div>
                </div>
              ) : userProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-full bg-gray-300 border border-gray-400 flex items-center justify-center text-gray-700 text-2xl font-bold">
                      {userProfile.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{userProfile.username}</h3>
                      <p className="text-gray-400 text-sm">{userProfile.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded border border-gray-200 p-4">
                      <p className="text-gray-400 text-xs mb-1 font-medium uppercase tracking-wider">Posts</p>
                      <p className="text-2xl font-bold text-gray-800">{userProfile.post_count}</p>
                    </div>
                    <div className="bg-gray-50 rounded border border-gray-200 p-4">
                      <p className="text-gray-400 text-xs mb-1 font-medium uppercase tracking-wider">Communities</p>
                      <p className="text-2xl font-bold text-gray-800">{userProfile.community_count}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded border border-gray-200 p-4">
                    <p className="text-gray-400 text-xs mb-1 font-medium uppercase tracking-wider">Member Since</p>
                    <p className="text-gray-800">
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Reports Section */}
                  {userProfile.report_count > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <h4 className="text-base font-bold text-gray-700">
                          Reports ({userProfile.report_count})
                        </h4>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {userProfile.reports.map((report) => (
                          <div
                            key={report.id}
                            className="bg-gray-50 rounded border border-gray-300 p-3"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-gray-700 font-medium text-sm mb-1">
                                  {report.reason}
                                </p>
                                {report.description && (
                                  <p className="text-gray-500 text-xs mb-2">
                                    {report.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-400">
                                    By: {report.reporter_username}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-600 border border-gray-300">
                                    {report.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.report_count === 0 && (
                    <div className="mb-4 bg-gray-50 rounded border border-gray-200 p-3">
                      <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
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
                      className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors font-medium text-sm"
                    >
                      Approve Request
                    </button>
                    <button
                      onClick={closeProfileModal}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-400 text-gray-600 rounded hover:bg-gray-100 transition-colors font-medium text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">Failed to load profile</p>
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