import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CreateCommunityProps {
  userId: string | null;
}

const Create_community = ({ userId }: CreateCommunityProps) => {
  const navigate = useNavigate();

  const [input, setInput] = useState({
    com_name: "",
    category: "",
    com_description: "",
    created_by: userId
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setInput(values => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://localhost/Interconnected/backend/api/create_community.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        }
      );

      const data = await response.json();
      console.log("Server response:", data);

      if (data.status === "success") {
        navigate("/home/community");
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">

          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Create Community
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-slate-300 mb-2">
                Community Name
              </label>
              <input
                type="text"
                name="com_name"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                placeholder="Enter community name"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                placeholder="e.g. Tech, Fitness, Gaming"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2">
                Description
              </label>
              <textarea
                name="com_description"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                placeholder="Describe your community"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
            >
              Create Community
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default Create_community;
