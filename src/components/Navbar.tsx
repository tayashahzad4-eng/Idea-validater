import { Link, useNavigate } from "react-router-dom";
import { User } from "../types";
import { LogOut, LayoutDashboard, PlusCircle, Zap } from "lucide-react";

interface NavbarProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export default function Navbar({ user, setUser }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="border-b border-gray-100 py-4 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="w-6 h-6 fill-black" />
          <span>Validate</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/validate" className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                New Validation
              </Link>
              <div className="h-4 w-px bg-gray-200" />
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-gray-600 hover:text-black">
                Login
              </Link>
              <Link
                to="/auth"
                className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
