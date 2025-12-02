import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Link } from "react-router-dom";
import Community from "./Community";
import Create_community from "./Create_community";
import Create_post from "./Create_post";
import logo from "../assets/logo.png";
import Feed from "./feed";

function Home() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  
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
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">

  {/* Left section: Logo + Home */}
  <div className="flex items-center space-x-4">
    <img 
      src={logo}
      className="w-10 h-10 rounded-full border border-slate-600"
    />

    <Link 
      to="/home" 
      className="hover:text-emerald-400 transition"
    >
      Home
    </Link>

    <Link 
      to="/home/community" 
      className="hover:text-emerald-400 transition"
    >
      Community
    </Link>

    <Link 
      to="/home/profile" 
      className="hover:text-emerald-400 transition"
    >
      Profile
    </Link>
    <Link 
      to="/home/post" 
      className="hover:text-emerald-400 transition"
    >
      Post
    </Link>

    <Link 
      to="/home/create_community" 
      className="hover:text-emerald-400 transition"
    >
      Create Community
    </Link>
  </div>

  {/* Right section: Logged-in username */}
  <div className="text-slate-300">
    Welcome, <span className="text-white font-semibold">{username}</span>!
  </div>

</nav>

      
      <Routes>
        <Route path="/community" element={<Community userId={userId} />} />
        <Route path="/" element={<Feed userId={userId}/>} />
        <Route path="/profile" element={<div>Profile </div>} />
        <Route path="/post" element={<Create_post userId={userId}/>} />
        <Route path="/create_community" element={<Create_community userId={userId} />} />
      </Routes>
    </>
  );
}

export default Home;