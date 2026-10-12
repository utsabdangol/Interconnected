import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Link } from "react-router-dom";
import Community from "./Community";
import Create_community from "./Create_community";
import Create_post from "./Create_post";
import logo from "../assets/logo.png";
import Feed from "./Feed";
import LogoutButton from "../components/LogoutButton";
import Profile from "./Profile.tsx";
import Admin from "./Admin.tsx";

function Home() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("http://localhost/Interconnected/backend/api/session-check.php", {
      method: "GET",
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.logged_in) {
          setUserId(data.user.id);
          setUsername(data.user.username);
          setIsAdmin(data.user.role_u === 'admin');
        } else {
          navigate("/login");
        }
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  return (
    <>
      <nav className="bg-white border-b border-gray-300 text-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        {/* Left section: Logo + Nav Links */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo"
              className="w-10 h-10 rounded border border-gray-300"
            />
            <span className="text-lg font-bold text-gray-800 hidden md:block">
              Interconnected
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/home"
              className="px-3 py-2 rounded text-sm hover:bg-gray-100 text-gray-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/home/community"
              className="px-3 py-2 rounded text-sm hover:bg-gray-100 text-gray-600 transition-colors font-medium"
            >
              Community
            </Link>
            <Link
              to="/home/profile"
              className="px-3 py-2 rounded text-sm hover:bg-gray-100 text-gray-600 transition-colors font-medium"
            >
              Profile
            </Link>
            <Link
              to="/home/post"
              className="px-3 py-2 rounded text-sm hover:bg-gray-100 text-gray-600 transition-colors font-medium"
            >
              Post
            </Link>
            <Link
              to="/home/create_community"
              className="px-3 py-2 rounded text-sm hover:bg-gray-100 text-gray-600 transition-colors font-medium"
            >
              Create Community
            </Link>
            {isAdmin && (
              <Link
                to="/home/admin"
                className="px-3 py-2 rounded text-sm hover:bg-gray-100 text-gray-600 transition-colors font-medium border border-gray-400"
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Right section: Welcome + Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block px-3 py-1.5 rounded border border-gray-300 bg-gray-50">
            <span className="text-gray-500 text-sm">
              Welcome, <span className="text-gray-800 font-semibold">{username}</span>!
            </span>
          </div>
          <LogoutButton />
        </div>
      </nav>

      <Routes>
        <Route path="/community" element={<Community />} />
        <Route path="/" element={<Feed userId={userId} />} />
        <Route path="/profile" element={<Profile userId={userId} />} />
        <Route path="/post" element={<Create_post />} />
        <Route path="/create_community" element={<Create_community />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default Home;