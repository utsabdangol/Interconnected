import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface CreatePostProps {
  userId: string | null;
}

interface UserCommunity {
  id: number;
  com_name: string;
  category: string;
}

const CreatePost = ({ userId }: CreatePostProps) => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<UserCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [input, setInput] = useState({
    community_id: "",
    title: "",
    content: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchUserCommunities();
  }, []);

  const fetchUserCommunities = async () => {
    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/community_actions.php?action=get_user_communities",
        {
          method: "GET",
          credentials: "include"
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setCommunities(data.communities);
        if (data.communities.length === 0) {
          setError("You need to join a community before posting");
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setInput(values => ({ ...values, [name]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("community_id", input.community_id);
      formData.append("title", input.title);
      formData.append("content", input.content);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(
        "http://localhost/Interconnected/backend/api/community_actions.php?action=create_post",
        {
          method: "POST",
          credentials: "include",
          body: formData // Don't set Content-Type header, browser will set it automatically
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        navigate("/home");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Create Post
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {communities.length === 0 ? (
            <div className="text-center">
              <p className="text-slate-300 mb-4">
                You need to join a community before you can post.
              </p>
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Browse Communities
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Select Community *
                </label>
                <select
                  name="community_id"
                  required
                  value={input.community_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Choose a community --</option>
                  {communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.com_name} ({community.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Post Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={input.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter post title"
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  required
                  value={input.content}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="What's on your mind?"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Upload Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Posting..." : "Create Post"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;