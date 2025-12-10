import { useState, useEffect } from "react";
import { Lock, Globe, Clock } from "lucide-react";

interface CommunityProps {
  userId: string | null;
}

interface Community {
  id: number;
  com_name: string;
  category: string;
  com_description: string;
  member_count: number;
  user_role: string | null;
  privacy: string;
}

function Community({ userId }: CommunityProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
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
        {
          method: "GET",
          credentials: "include"
        }
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
          headers: {
            "Content-Type": "application/json"
          },
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

  const getButtonState = (community: Community) => {
    if (community.user_role === 'member' || community.user_role === 'creator') {
      return {
        text: "Joined",
        disabled: true,
        className: "px-4 py-2 bg-slate-600 text-slate-400 rounded-lg cursor-not-allowed"
      };
    } else if (community.user_role === 'requesting') {
      return {
        text: "Pending",
        disabled: true,
        className: "px-4 py-2 bg-yellow-600/50 text-yellow-400 rounded-lg cursor-not-allowed flex items-center gap-2"
      };
    } else {
      return {
        text: community.privacy === 'private' ? "Request to Join" : "Join",
        disabled: joiningId === community.id,
        className: "px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading communities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Discover Communities
        </h1>

        {communities.length === 0 ? (
          <div className="text-center text-slate-400 text-xl mt-12">
            No communities yet. Be the first to create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => {
              const buttonState = getButtonState(community);
              
              return (
                <div
                  key={community.id}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-white">
                        {community.com_name}
                      </h2>
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
                    <span className="inline-block px-3 py-1 bg-blue-600/30 text-blue-400 rounded-full text-sm font-medium">
                      {community.category}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-4 line-clamp-3">
                    {community.com_description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                    <span className="text-slate-400 text-sm">
                      {community.member_count} {community.member_count === 1 ? 'member' : 'members'}
                    </span>

                    <button
                      onClick={() => !buttonState.disabled && handleJoin(community.id)}
                      disabled={buttonState.disabled}
                      className={buttonState.className}
                    >
                      {community.user_role === 'requesting' && <Clock className="w-4 h-4" />}
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