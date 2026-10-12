import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: ""
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInput(values => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch("http://localhost/Interconnected/backend/api/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        navigate("/home");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("Could not connect to server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded border border-gray-300 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-gray-100 border border-gray-400 rounded">
              <p className="text-gray-700 text-center font-medium">Login Successful!</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-gray-100 border border-gray-400 rounded">
              <p className="text-gray-600 text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-gray-600 font-medium mb-2 text-sm">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-600 font-medium mb-2 text-sm">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gray-800 text-white font-semibold rounded hover:bg-gray-700 transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-4">Don't have an account?</p>
            <Link to="/register">
              <button className="w-full py-2.5 bg-white border border-gray-400 text-gray-700 font-semibold rounded hover:bg-gray-100 transition-colors">
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;