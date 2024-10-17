import React from "react";
import { Link } from "react-router-dom";
import img from "../assets/Circle-icons-cloud.svg.png";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6494b4] to-[#567c92] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div className="text-center">
          <img
            src={img}
            alt="I-Memory Logo"
            className="mx-auto h-16 w-auto mb-4"
          />
          <h2 className="mt-6 text-9xl font-extrabold text-[#6494b4]">404</h2>
          <p className="mt-2 text-3xl font-bold text-[#567c92]">
            Page Not Found
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <div className="animate-bounce flex justify-center">
            <svg
              className="h-10 w-10 text-[#6494b4]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
          <Link
            to="/"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-lg font-medium text-white bg-[#6494b4] hover:bg-[#567c92] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6494b4] transition duration-300"
          >
            Back to Homepage
          </Link>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            If you think this is a mistake, please{" "}
            <Link
              to="/contact"
              className="font-medium text-[#6494b4] hover:text-[#567c92]"
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
