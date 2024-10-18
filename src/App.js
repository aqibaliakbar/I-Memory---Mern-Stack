import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Login from "./components/Login";
import Signup from "./components/Signup";
import NoteState from "./context/notes/NoteState";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./toastify-config.css";
import NotFound from "./components/NotFound";
import { ReCaptchaWrapper } from "./components/ReCaptchaWrapper";
import { MainLayout } from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { ProtectedRoute } from "./Routes/ProtectedRoutes";
import { GuestRoute } from "./Routes/GuestRoutes";

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

          {/* Guest Routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <AuthLayout>
                  <ReCaptchaWrapper>
                    <Login showAlert={showAlert} />
                  </ReCaptchaWrapper>
                </AuthLayout>
              </GuestRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <GuestRoute>
                <AuthLayout>
                  <ReCaptchaWrapper>
                    <Signup showAlert={showAlert} />
                  </ReCaptchaWrapper>
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <AuthLayout>
                  <ReCaptchaWrapper>
                    <ForgotPassword showAlert={showAlert} />
                  </ReCaptchaWrapper>
                </AuthLayout>{" "}
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestRoute>
                <AuthLayout>
                  <ReCaptchaWrapper>
                    <ResetPassword showAlert={showAlert} />{" "}
                  </ReCaptchaWrapper>
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
