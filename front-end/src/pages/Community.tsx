import { useState, useEffect } from "react";
import { Lock, Globe, Clock } from "lucide-react";

interface CommunityData {
  id: number;
  com_name: string;
  category: string;
  com_description: string;
  member_count: number;
  user_role: string | null;
  privacy: string;
}

function Community() {
  const [communities, setCommunities] = useState<CommunityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/get_communities.php",
        { method: "GET", credentials: "include" }
      );
      const data = await response.json();
      if (data.status === "success") {
        setCommunities(data.communities);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (communityId: number) => {
    setJoiningId(communityId);
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/join_community.php",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ community_id: communityId })
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        fetchCommunities();
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to join community");
    } finally {
      setJoiningId(null);
    }
  };

  const getButtonState = (community: CommunityData) => {
    if (community.user_role === 'member' || community.user_role === 'creator') {
      return {
        text: "Joined",
        disabled: true,
        className: "px-4 py-2 bg-gray-200 text-gray-500 rounded border border-gray-300 cursor-not-allowed text-sm font-medium"
      };
    } else if (community.user_role === 'requesting') {
      return {
        text: "Pending",
        disabled: true,
        className: "px-4 py-2 bg-gray-100 text-gray-500 rounded border border-gray-300 cursor-not-allowed flex items-center gap-2 text-sm font-medium"
      };
    } else {
      return {
        text: community.privacy === 'private' ? "Request to Join" : "Join",
        disabled: joiningId === community.id,
        className: "px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading communities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Discover Communities</h1>
          <div className="w-24 h-0.5 bg-gray-300 mx-auto"></div>
        </div>

        {communities.length === 0 ? (
          <div className="bg-white rounded border-2 border-dashed border-gray-300 p-16 text-center">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No communities yet</p>
            <p className="text-gray-400 mt-2">Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {communities.map((community) => {
              const buttonState = getButtonState(community);
              return (
                <div
                  key={community.id}
                  className="bg-white rounded border border-gray-300 p-6 hover:border-gray-400 transition-colors"
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-xl font-bold text-gray-800">
                        {community.com_name}
                      </h2>
                      {community.privacy === 'private' ? (
                        <div className="p-1.5 rounded border border-gray-300 bg-gray-50" title="Private Community">
                          <Lock className="w-4 h-4 text-gray-500" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded border border-gray-300 bg-gray-50" title="Public Community">
                          <Globe className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded border border-gray-300 text-xs font-medium">
                      {community.category}
                    </span>
                  </div>

                  <p className="text-gray-500 mb-5 line-clamp-3 leading-relaxed text-sm">
                    {community.com_description}
                  </p>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200">
                    <span className="text-gray-400 text-xs font-medium">
                      {community.member_count} {community.member_count === 1 ? 'member' : 'members'}
                    </span>
                    <button
                      onClick={() => !buttonState.disabled && handleJoin(community.id)}
                      disabled={buttonState.disabled}
                      className={buttonState.className}
                    >
                      {community.user_role === 'requesting' && <Clock className="w-4 h-4 inline mr-1" />}
                      {joiningId === community.id ? "Processing..." : buttonState.text}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Community;