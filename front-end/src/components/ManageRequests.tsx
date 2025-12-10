import { useState, useEffect } from "react";
import { Check, X, Clock } from "lucide-react";

interface ManageRequestsProps {
  userId: string | null;
}

interface Request {
  request_id: number;
  community_id: number;
  user_id: number;
  username: string;
  com_name: string;
  joined_at: string;
}

const ManageRequests = ({ userId }: ManageRequestsProps) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Manage Join Requests
        </h1>

        {requests.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-12 border border-slate-700/50 text-center">
            <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.request_id}
                className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {request.username}
                  </h3>
                  <p className="text-slate-400">
                    wants to join <span className="text-blue-400">{request.com_name}</span>
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    Requested {new Date(request.joined_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(request.request_id)}
                    disabled={processingId === request.request_id}
                    className="p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                    title="Approve"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleReject(request.request_id)}
                    disabled={processingId === request.request_id}
                    className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
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
    </div>
  );
};

export default ManageRequests;