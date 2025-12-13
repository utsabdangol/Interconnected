import { useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // IMPORTANT: Match the exact case of your backend folder
      const response = await fetch("http://localhost/Interconnected/backend/api/logout.php", {
        method: "POST",
        credentials: "include"
      });

      const data = await response.json();
      console.log(data.message);

      if (data.success) {
        navigate("/login");
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <LogOut className="w-4 h-4" />
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
};

export default LogoutButton;