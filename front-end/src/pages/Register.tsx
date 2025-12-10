import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInput(values => ({ ...values, [name]: value }));
    // Clear error for this field when user types
    setErrors(prev => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Username validation
    if (input.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    } else if (input.username.length > 20) {
      newErrors.username = "Username must be less than 20 characters";
    } else if (/^\d/.test(input.username)) {
      newErrors.username = "Username cannot start with a number";
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(input.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!/^[a-zA-Z]/.test(input.email)) {
      newErrors.email = "Email cannot start with a number";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (input.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (input.password.length > 50) {
      newErrors.password = "Password must be less than 50 characters";
    } else if (!/(?=.*[a-z])/.test(input.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(input.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(input.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (input.password !== input.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost/Interconnected/backend/api/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: input.username,
          email: input.email,
          password: input.password
        }),
      });
      const data = await response.json();

      if (data.status === "success") {
        navigate("/login");
      } else {
        setServerError(data.message || "Registration failed");
      }
    } catch (error) {
      setServerError("Could not connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Create Account
          </h1>

          {serverError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-center">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-slate-300 font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                required
                value={input.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.username
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-600 focus:ring-emerald-500"
                }`}
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-slate-300 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={input.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-600 focus:ring-emerald-500"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-slate-300 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                value={input.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-600 focus:ring-emerald-500"
                }`}
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                Must be 6+ characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-slate-300 font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                required
                value={input.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-600 focus:ring-emerald-500"
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 mb-4">Already have an account?</p>
            <Link to="/login">
              <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50">
                Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;