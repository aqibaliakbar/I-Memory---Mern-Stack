import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import img from "../assets/Circle-icons-cloud.svg.png";
import { isLoggedIn, logout } from "../SessionManager/auth";
import { IoMdLogOut } from "react-icons/io";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };



  return (
    <nav className="bg-[#fff] shadow-md">
      <div className="container  mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img className="h-10 w-10" src={img} alt="I-Memory Logo" />
            </Link>
            <Link to="/" className="text-[#78B5D5] text-2xl font-bold ml-2">
              I-Memory
            </Link>
          </div>
          {isLoggedIn() && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#78B5D5]  hover:text-[#6494b4] transition duration-300"
                >
                  <IoMdLogOut className="h-7 w-7" />
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
