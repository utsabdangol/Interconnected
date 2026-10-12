import * as React from "react";
import logo from "../assets/logo_name.png";
import { Link } from "react-router-dom";
import { Users, Globe, MessageSquare, Sparkles } from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-4 bg-white border-b border-gray-300 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={logo} alt="logo" className="h-10 md:h-12" />
          <span className="text-lg md:text-xl font-bold text-gray-800 hidden md:block">
            Interconnected
          </span>
        </div>
        <div className="flex gap-3">
          <Link to="/login">
            <button className="px-5 py-2 rounded border border-gray-400 bg-white text-gray-700 font-medium hover:bg-gray-100 transition-colors">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="px-5 py-2 rounded border border-gray-700 bg-gray-700 text-white font-medium hover:bg-gray-600 transition-colors">
              Register
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center mt-20 md:mt-32 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full">
              <Sparkles className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500 text-sm font-medium">Join thousands of users</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-800 mb-6 leading-tight">
            Welcome to{" "}
            <span className="text-gray-600">Interconnected</span>
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed">
            Connect with people who share your interests and build amazing communities together!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link to="/register">
              <button className="px-8 py-4 bg-gray-800 text-white font-bold rounded border border-gray-800 hover:bg-gray-700 transition-colors text-lg">
                Get Started
              </button>
            </Link>
            <Link to="/login">
              <button className="px-8 py-4 bg-white border border-gray-400 text-gray-700 font-bold rounded hover:bg-gray-100 transition-colors text-lg">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded border border-gray-300 p-8 hover:border-gray-400 transition-colors">
            <div className="p-3 rounded border border-gray-300 bg-gray-50 w-fit mb-4">
              <Users className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Join Communities</h3>
            <p className="text-gray-500 leading-relaxed">
              Discover and join communities that match your interests. Connect with like-minded people from around the world.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded border border-gray-300 p-8 hover:border-gray-400 transition-colors">
            <div className="p-3 rounded border border-gray-300 bg-gray-50 w-fit mb-4">
              <Globe className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Create Your Own</h3>
            <p className="text-gray-500 leading-relaxed">
              Start your own community and invite others to join. Build a space where people can share ideas and collaborate.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded border border-gray-300 p-8 hover:border-gray-400 transition-colors">
            <div className="p-3 rounded border border-gray-300 bg-gray-50 w-fit mb-4">
              <MessageSquare className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Share & Engage</h3>
            <p className="text-gray-500 leading-relaxed">
              Post your thoughts, share images, and engage with others through comments and likes. Make your voice heard!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-white rounded border-2 border-dashed border-gray-300 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Join Interconnected today and start connecting with amazing people in communities that matter to you.
          </p>
          <Link to="/register">
            <button className="px-10 py-4 bg-gray-800 text-white font-bold rounded border border-gray-800 hover:bg-gray-700 transition-colors text-lg">
              Create Your Account
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-300 py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Interconnected. Connect, Share, Grow.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;