import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Globe } from "lucide-react";

interface CreateCommunityProps {
  userId: string | null;
}

const Create_community = ({ userId }: CreateCommunityProps) => {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    com_name: "",
    category: "",
    com_description: "",
    privacy: "public"
  });
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setInput(values => ({ ...values, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/create_community.php",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        navigate("/home");
      } else {
        setError(data.message || "Failed to create community");
      }
    } catch (error) {
      setError("Could not connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Create Community
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Community Name *
              </label>
              <input
                type="text"
                name="com_name"
                required
                value={input.com_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Enter community name"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                required
                value={input.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g. Tech, Fitness, Gaming"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Privacy *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setInput({ ...input, privacy: "public" })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    input.privacy === "public"
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : "border-slate-600 bg-slate-900/50 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Public</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInput({ ...input, privacy: "private" })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    input.privacy === "private"
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-slate-600 bg-slate-900/50 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Private</span>
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {input.privacy === "public"
                  ? "Anyone can view and join this community"
                  : "Only invited members can view and join"}
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Description *
              </label>
              <textarea
                name="com_description"
                required
                value={input.com_description}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe your community"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Community"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Create_community;