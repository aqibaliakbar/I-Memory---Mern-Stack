import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Login from "./components/Login";
import Signup from "./components/Signup";
// import Alert from "./components/Alert";
import NoteState from "./context/notes/NoteState";
import { useState } from "react";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./toastify-config.css";
import NotFound from "./components/NotFound";

// Layout components
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const AuthLayout = ({ children }) => (
  <div className="auth-layout">{children}</div>
);

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("authToken");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Guest Route component
const GuestRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("authToken");
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {


   const showAlert = (message, type) => {
     switch (type) {
       case "success":
         toast.success(message);
         break;
       case "error":
         toast.error(message);
         break;
       default:
         toast.info(message);
     }
   };

  return (
    <Router>
      <NoteState>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Home showAlert={showAlert} />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <About />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Guest Routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <AuthLayout>
                  <Login showAlert={showAlert} />
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <AuthLayout>
                  <Signup showAlert={showAlert} />
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <AuthLayout>
                  <ForgotPassword showAlert={showAlert} />
                </AuthLayout>{" "}
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestRoute>
                <AuthLayout>
                  <ResetPassword showAlert={showAlert} />{" "}
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </NoteState>
    </Router>
  );
}

export default App;
