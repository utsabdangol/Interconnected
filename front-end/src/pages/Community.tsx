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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-3">Discover Communities</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto rounded-full"></div>
        </div>

        {communities.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-16 border border-blue-500/20 shadow-2xl shadow-blue-500/10 text-center">
            <Globe className="w-20 h-20 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 text-xl font-semibold">No communities yet</p>
            <p className="text-slate-400 mt-2">Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community, index) => {
              const buttonState = getButtonState(community);
              
              return (
                <div
                  key={community.id}
                  className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-2xl font-bold text-white">
                        {community.com_name}
                      </h2>
                      {community.privacy === 'private' ? (
                        <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30" title="Private Community">
                          <Lock className="w-4 h-4 text-blue-400" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30" title="Public Community">
                          <Globe className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}
                    </div>
                    <span className="inline-block px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-semibold border border-blue-500/30">
                      {community.category}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-5 line-clamp-3 leading-relaxed">
                    {community.com_description}
                  </p>

                  <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-700/50">
                    <span className="text-slate-400 text-sm font-medium">
                      {community.member_count} {community.member_count === 1 ? 'member' : 'members'}
                    </span>

                    <button
                      onClick={() => !buttonState.disabled && handleJoin(community.id)}
                      disabled={buttonState.disabled}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        buttonState.disabled
                          ? buttonState.className
                          : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50"
                      }`}
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