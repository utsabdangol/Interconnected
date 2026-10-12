import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Globe } from "lucide-react";

const Create_community = () => {
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

  const inputClass = "w-full px-4 py-2.5 bg-white border border-gray-300 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded border border-gray-300 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Community</h1>
            <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gray-100 border border-gray-400 rounded">
              <p className="text-gray-600 text-center text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-600 font-medium mb-2 text-sm">
                Community Name *
              </label>
              <input
                type="text"
                name="com_name"
                required
                value={input.com_name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter community name"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-2 text-sm">
                Category *
              </label>
              <input
                type="text"
                name="category"
                required
                value={input.category}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Tech, Fitness, Gaming"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-2 text-sm">
                Privacy *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInput({ ...input, privacy: "public" })}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded border-2 transition-colors text-sm font-medium ${input.privacy === "public"
                      ? "border-gray-700 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Public</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInput({ ...input, privacy: "private" })}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded border-2 transition-colors text-sm font-medium ${input.privacy === "private"
                      ? "border-gray-700 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Private</span>
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {input.privacy === "public"
                  ? "Anyone can view and join this community"
                  : "Only invited members can view and join"}
              </p>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-2 text-sm">
                Description *
              </label>
              <textarea
                name="com_description"
                required
                value={input.com_description}
                onChange={handleChange}
                rows={5}
                className={`${inputClass} resize-none`}
                placeholder="Describe your community"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gray-800 text-white font-semibold rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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