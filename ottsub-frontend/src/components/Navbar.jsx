import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-black text-white px-6 md:px-16 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold">
        SmartSubs
      </Link>

      <div className="flex gap-4 items-center text-sm">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/search" className="hover:underline">
          Search
        </Link>
        <Link to="/profile" className="hover:underline">
          My OTTs
        </Link>
        <Link to="/notifications" className="hover:underline">
          Notifications
        </Link>

        {user ? (
          <>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <div className="flex items-center gap-2 ml-3">
              <div className="bg-gray-700 rounded-full w-9 h-9 flex items-center justify-center">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <span>{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="ml-3 hover:underline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/signup" className="hover:underline">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
