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

  // Single useEffect - removed duplicate
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
      <nav className="bg-gradient-to-r from-slate-900 via-blue-900/50 to-slate-900 backdrop-blur-xl border-b border-blue-500/20 text-white px-6 py-4 flex items-center justify-between shadow-2xl shadow-blue-500/10 sticky top-0 z-40">
        {/* Left section: Logo + Nav Links */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 rounded-full border-2 border-blue-400/50 shadow-lg shadow-blue-500/30 hover:scale-110 transition-transform duration-300"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent hidden md:block">
              Interconnected
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/home"
              className="px-4 py-2 rounded-lg hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-300 font-medium"
            >
              Home
            </Link>
            <Link
              to="/home/community"
              className="px-4 py-2 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-300 transition-all duration-300 font-medium"
            >
              Community
            </Link>
            <Link
              to="/home/profile"
              className="px-4 py-2 rounded-lg hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-300 font-medium"
            >
              Profile
            </Link>
            <Link
              to="/home/post"
              className="px-4 py-2 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-300 transition-all duration-300 font-medium"
            >
              Post
            </Link>
            <Link
              to="/home/create_community"
              className="px-4 py-2 rounded-lg hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-300 font-medium"
            >
              Create Community
            </Link>
            {isAdmin && (
              <Link
                to="/home/admin"
                className="px-4 py-2 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 font-medium border border-red-500/30"
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Right section: Welcome + Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-500/30">
            <span className="text-slate-300">
              Welcome, <span className="text-white font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{username}</span>!
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