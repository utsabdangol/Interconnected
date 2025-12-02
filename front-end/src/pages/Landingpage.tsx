import * as React from "react";
import logo from "../assets/logo_name.png";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-sm shadow-lg">
        <div className="logo">
          <img src={logo} alt="logo" className="h-12 md:h-14" />
        </div>
        <div className="flex gap-4">
          <Link to="/login">
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50">
              Register
            </button>
          </Link>
        </div>
      </nav>
      
      <header className="text-center mt-32 px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Welcome to Interconnected
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
          Connect with people who share your interests!
        </p>
      </header>
    </div>
  );
};

export default LandingPage;