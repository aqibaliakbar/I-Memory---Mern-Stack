import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import img from "../assets/Circle-icons-cloud.svg.png";
import { isLoggedIn, logout } from "../SessionManager/auth";
import { IoMdLogOut } from "react-icons/io";
import { FaHome, FaInfoCircle } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className="bg-[#6494b4] shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img className="h-10 w-10" src={img} alt="I-Memory Logo" />
            </Link>
            <Link to="/" className="text-[#fff] text-2xl font-bold ml-2">
              I-Memory
            </Link>
          </div>

          {/* Hamburger Menu Button for mobile screens */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <HiX className="h-7 w-7" />
              ) : (
                <HiMenu className="h-7 w-7" />
              )}
            </button>
          </div>

          {/* Desktop Menu */}
          {isLoggedIn() && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => navigate("/")}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#78B5D5] hover:bg-[#567c92] transition duration-300"
                  aria-label="Home"
                >
                  <FaHome className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#78B5D5] hover:bg-[#567c92] transition duration-300"
                  aria-label="About"
                >
                  <FaInfoCircle className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#78B5D5] hover:bg-[#567c92] transition duration-300"
                  aria-label="Logout"
                >
                  <IoMdLogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isLoggedIn() && (
          <div
            className={`md:hidden fixed left-0 right-0 bg-[#6494b4] transition-all duration-300 ease-in-out ${
              isMobileMenuOpen
                ? "max-h-screen opacity-100"
                : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="flex flex-col items-center space-y-2 px-4 py-4">
              <button
                onClick={() => navigate("/")}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#78B5D5] hover:bg-[#567c92] transition duration-300 w-full text-center"
              >
                <FaHome className="h-5 w-5 inline-block mr-2" />
                Home
              </button>
              <button
                onClick={() => navigate("/about")}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#78B5D5] hover:bg-[#567c92] transition duration-300 w-full text-center"
              >
                <FaInfoCircle className="h-5 w-5 inline-block mr-2" />
                About
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#78B5D5] hover:bg-[#567c92] transition duration-300 w-full text-center"
              >
                <IoMdLogOut className="h-5 w-5 inline-block mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
