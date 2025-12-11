import * as React from "react";
import logo from "../assets/logo_name.png";
import { Link } from "react-router-dom";
import { Users, Globe, MessageSquare, Sparkles } from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 bg-gradient-to-r from-slate-900/80 via-blue-900/40 to-slate-900/80 backdrop-blur-xl border-b border-blue-500/20 shadow-2xl shadow-blue-500/10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={logo} alt="logo" className="h-12 md:h-14 hover:scale-110 transition-transform duration-300" />
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent hidden md:block">
            Interconnected
          </span>
        </div>
        <div className="flex gap-3">
          <Link to="/login">
            <button className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105">
              Register
            </button>
          </Link>
        </div>
      </nav>
      
      {/* Hero Section */}
      <header className="text-center mt-20 md:mt-32 px-4 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-semibold">Join thousands of users</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Interconnected
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Connect with people who share your interests and build amazing communities together!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link to="/register">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-emerald-500 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 text-lg">
                Get Started
              </button>
            </Link>
            <Link to="/login">
              <button className="px-8 py-4 bg-slate-800/50 border border-slate-700/50 text-white font-bold rounded-xl hover:bg-slate-700/50 transition-all duration-300 hover:scale-110 text-lg">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/20 shadow-xl shadow-blue-500/10 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 animate-fade-in">
            <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/30 w-fit mb-4">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Join Communities</h3>
            <p className="text-slate-300 leading-relaxed">
              Discover and join communities that match your interests. Connect with like-minded people from around the world.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 w-fit mb-4">
              <Globe className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Create Your Own</h3>
            <p className="text-slate-300 leading-relaxed">
              Start your own community and invite others to join. Build a space where people can share ideas and collaborate.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 shadow-xl shadow-purple-500/10 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="p-4 rounded-xl bg-purple-500/20 border border-purple-500/30 w-fit mb-4">
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Share & Engage</h3>
            <p className="text-slate-300 leading-relaxed">
              Post your thoughts, share images, and engage with others through comments and likes. Make your voice heard!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-blue-500/20 via-emerald-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-12 border border-blue-500/30 shadow-2xl shadow-blue-500/20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join Interconnected today and start connecting with amazing people in communities that matter to you.
          </p>
          <Link to="/register">
            <button className="px-10 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-emerald-500 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 text-lg">
              Create Your Account
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400">
            © 2024 Interconnected. Connect, Share, Grow.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;