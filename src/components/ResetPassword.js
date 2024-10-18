import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import img from "../assets/Circle-icons-cloud.svg.png";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

const ResetPassword = ({ showAlert }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [credentials, setCredentials] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

   const handleSubmit = async (e) => {
     e.preventDefault();
     if (credentials.newPassword !== credentials.confirmPassword) {
       showAlert("Passwords do not match", "error");
       return;
     }
     if (!executeRecaptcha) {
       console.log("Execute recaptcha not yet available");
       return;
     }

     setLoading(true);
     try {
       const token = await executeRecaptcha("resetPassword");
       if (!token) {
         showAlert("CAPTCHA verification failed. Please try again.", "error");
         return;
       }

       const response = await fetch(
         "http://localhost:5000/api/auth/reset-password",
         {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             email: credentials.email,
             otp: credentials.otp,
             newPassword: credentials.newPassword,
             captchaToken: token,
           }),
         }
       );
       const json = await response.json();
       if (json.message) {
         showAlert(
           "Password reset successful. You can now log in with your new password.",
           "success"
         );
         navigate("/login");
       } else {
        showAlert(json.error, "error");
      }
    } catch (error) {
      showAlert("An error occurred. Please try again.", "error");
    } finally {
       setLoading(false);
     }
   };

   const handleResendOTP = async () => {
     setResendLoading(true);
     try {
       const response = await fetch(
         "http://localhost:5000/api/auth/resend-otp",
         {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             email: credentials.email,
             type: "reset",
           }),
         }
       );
       const json = await response.json();
       if (json.message) {
         setCountdown(600); // 10 minutes
         showAlert(
           "New OTP sent. Please check your email and phone (if enabled).",
           "success"
         );
       } else {
         showAlert(
           json.error || "Failed to resend OTP. Please try again.",
           "error"
         );
       }
     } catch (error) {
       showAlert(
         "Unable to connect to the server. Please check your internet connection and try again.",
         "error"
       );
     } finally {
       setResendLoading(false);
     }
   };
  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6494b4] to-[#567c92] flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <img src={img} alt="I-Memory Logo" className="h-12 mr-3" />
          <h3 className="text-3xl font-bold text-[#6494b4]">I-Memory</h3>
        </div>
        <h4 className="text-2xl text-[#567c92] text-center mb-8">
          Reset Password
        </h4>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-[#6494b4] mb-1"
            >
              OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={credentials.otp}
              onChange={onChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent transition duration-300"
              placeholder="Enter OTP"
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-[#6494b4] mb-1"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={credentials.newPassword}
                onChange={onChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent transition duration-300"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                  >
                    <path
                      fill="currentColor"
                      d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                  >
                    <path
                      fill="currentColor"
                      d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"
                    ></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <PasswordStrengthMeter password={credentials.newPassword} />
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#6494b4] mb-1"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showCPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={credentials.confirmPassword}
                onChange={onChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent transition duration-300"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowCPassword(!showCPassword)}
              >
                {showCPassword ? (
                  <svg
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                  >
                    <path
                      fill="currentColor"
                      d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                  >
                    <path
                      fill="currentColor"
                      d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"
                    ></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#6494b4] text-white py-3 px-4 rounded-md hover:bg-[#567c92] transition duration-300 shadow-md text-lg font-semibold"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <div className="mt-4 text-center">
          {countdown > 0 ? (
            <p className="text-[#567c92]">
              Resend OTP in {Math.floor(countdown / 60)}:
              {countdown % 60 < 10 ? "0" : ""}
              {countdown % 60}
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              className="text-[#6494b4] hover:underline"
              disabled={resendLoading}
            >
              {resendLoading ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </div>
        <p className="mt-8 text-center text-sm text-[#567c92]">
          Remember your password?{" "}
          <a
            href="#"
            onClick={() => navigate("/login")}
            className="font-medium text-[#6494b4] hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;