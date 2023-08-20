import React from "react";
import img from "../assets/Circle-icons-cloud.svg.png";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  let navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  let location = useLocation();
  useEffect(() => {}, [location]);

  return (
    <div>
      {localStorage.getItem("authToken") ? (
        <nav className="navbar navbar-expand-lg ">
          <div className="container-fluid ">
            <Link className="navbar-brand nav-text" to="/">
              <img id="img1" src={img} alt="" />
              I-Memory
            </Link>
            <button
              className="navbar-toggler "
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon "></span>
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link
                    className={`nav-link nav-text ${
                      location.pathname === "/" ? "active" : ""
                    }`}
                    aria-current="page"
                    to="/"
                  >
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link nav-text ${
                      location.pathname === "/about" ? "active" : ""
                    }`}
                    to="/about"
                  >
                    About
                  </Link>
                </li>
              </ul>
              {!localStorage.getItem("authToken") ? (
                <form className="d-flex"></form>
              ) : (
                <button
                  className="btn btn-outline-success btn-1 mx-2"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </nav>
      ) : (
        <div>
          {" "}
          <Link
            className="btn btn-outline-success btn-1 mx-3 mt-4 float-end "
            to="/login"
            role="button"
          >
            Login
          </Link>
          <Link
            className="btn btn-outline-success btn-1 mx-2 mt-4 float-end"
            to="/signup"
            role="button"
          >
            Signup
          </Link>{" "}
        </div>
      )}
    </div>
  );
};

export default Navbar;
