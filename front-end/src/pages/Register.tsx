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
    setErrors(prev => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (input.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    } else if (input.username.length > 20) {
      newErrors.username = "Username must be less than 20 characters";
    } else if (/^\d/.test(input.username)) {
      newErrors.username = "Username cannot start with a number";
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(input.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    if (!/^[a-zA-Z]/.test(input.email)) {
      newErrors.email = "Email cannot start with a number";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      newErrors.email = "Please enter a valid email address";
    }

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

    if (input.password !== input.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost/Interconnected/backend/api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 bg-white border rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all ${errors[field] ? "border-gray-500" : "border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded border border-gray-300 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h1>
            <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-gray-100 border border-gray-400 rounded">
              <p className="text-gray-600 text-center text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-gray-600 font-medium mb-2 text-sm">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                required
                value={input.username}
                onChange={handleChange}
                className={inputClass("username")}
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-gray-500">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-600 font-medium mb-2 text-sm">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={input.email}
                onChange={handleChange}
                className={inputClass("email")}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-gray-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-gray-600 font-medium mb-2 text-sm">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                value={input.password}
                onChange={handleChange}
                className={inputClass("password")}
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-gray-500">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Must be 6+ characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-600 font-medium mb-2 text-sm">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                required
                value={input.confirmPassword}
                onChange={handleChange}
                className={inputClass("confirmPassword")}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-gray-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gray-800 text-white font-semibold rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-4">Already have an account?</p>
            <Link to="/login">
              <button className="w-full py-2.5 bg-white border border-gray-400 text-gray-700 font-semibold rounded hover:bg-gray-100 transition-colors">
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