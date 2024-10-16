import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import img from "../assets/Circle-icons-cloud.svg.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#6494b4] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img className="h-8 w-8" src={img} alt="I-Memory Logo" />
            </Link>
            <Link to="/" className="text-white text-xl font-semibold ml-2">
              I-Memory
            </Link>
          </div>
          {localStorage.getItem("authToken") && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/")
                      ? "bg-[#567c92] text-white"
                      : "text-white hover:bg-[#567c92] hover:text-white"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/about")
                      ? "bg-[#567c92] text-white"
                      : "text-white hover:bg-[#567c92] hover:text-white"
                  }`}
                >
                  About
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#567c92]  hover:text-[#6494b4] transition duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
