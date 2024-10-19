import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import img from "../assets/Circle-icons-cloud.svg.png";

const baseUrl = process.env.REACT_APP_BASE_URL;

const ForgotPassword = ({ showAlert }) => {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      console.log("Execute recaptcha not yet available");
      return;
    }

    setLoading(true);
    try {
      const token = await executeRecaptcha("forgotPassword");
      if (!token) {
        showAlert("reCAPTCHA verification failed. Please try again.", "error");
        return;
      }

      const response = await fetch(
          `${baseUrl}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, captchaToken: token }),
        }
      );
      const json = await response.json();
      if (json.message) {
        setOtpSent(true);
        showAlert(
          "OTP sent to your email and phone (if enabled). Please check your inbox and messages.",
          "success"
        );
      }else {
        showAlert(json.error, "error");
      }
    } catch (error) {
      showAlert("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6494b4] to-[#567c92] flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <img src={img} alt="I-Memory Logo" className="h-12 mr-3" />
          <h3 className="text-3xl font-bold text-[#6494b4]">I-Memory</h3>
        </div>
        <h4 className="text-2xl text-[#567c92] text-center mb-8">
          {otpSent ? "Check Your Email and Phone" : "Forgot Password"}
        </h4>
        {!otpSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#6494b4] mb-1"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent transition duration-300"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#6494b4] text-white py-3 px-4 rounded-md hover:bg-[#567c92] transition duration-300 shadow-md text-lg font-semibold"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset OTP"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-[#567c92] mb-4">
              An OTP has been sent to your email and phone (if enabled). Use it
              to reset your password.
            </p>
            <button
              onClick={() =>
                navigate("/reset-password", { state: { email: email } })
              }
              className="w-full bg-[#6494b4] text-white py-3 px-4 rounded-md hover:bg-[#567c92] transition duration-300 shadow-md text-lg font-semibold"
            >
              Reset Password
            </button>
          </div>
        )}
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

export default ForgotPassword;
