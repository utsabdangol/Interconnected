import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface UserCommunity {
  id: number;
  com_name: string;
  category: string;
}

const CreatePost = () => {
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
        { method: "GET", credentials: "include" }
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
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
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
      if (imageFile) formData.append("image", imageFile);

      const response = await fetch(
        "http://localhost/Interconnected/backend/api/community_actions.php?action=create_post",
        { method: "POST", credentials: "include", body: formData }
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

  const inputClass = "w-full px-4 py-2.5 bg-white border border-gray-300 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded border border-gray-300 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Post</h1>
            <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gray-100 border border-gray-400 rounded">
              <p className="text-gray-600 text-center text-sm">{error}</p>
            </div>
          )}

          {communities.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-500 mb-4 text-sm">
                You need to join a community before you can post.
              </p>
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-2.5 bg-white border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                <Link to="/home/community" className="text-gray-700">Browse Community</Link>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-600 font-medium mb-2 text-sm">
                  Select Community *
                </label>
                <select
                  name="community_id"
                  required
                  value={input.community_id}
                  onChange={handleChange}
                  className={inputClass}
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
                <label className="block text-gray-600 font-medium mb-2 text-sm">
                  Post Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={input.title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter post title"
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-2 text-sm">
                  Content *
                </label>
                <textarea
                  name="content"
                  required
                  value={input.content}
                  onChange={handleChange}
                  rows={8}
                  className={`${inputClass} resize-none`}
                  placeholder="What's on your mind?"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-2 text-sm">
                  Upload Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded text-gray-600 file:mr-4 file:py-1.5 file:px-4 file:rounded file:border file:border-gray-400 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer file:text-sm"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-gray-800 text-white font-semibold rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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