import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import img from "../assets/Circle-icons-cloud.svg.png";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

const baseUrl = process.env.REACT_APP_BASE_URL;

const Signup = ({ showAlert }) => {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    cpassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (credentials.password !== credentials.cpassword) {
      showAlert("Passwords do not match", "error");
      return;
    }
    if (!executeRecaptcha) {
      console.log("Execute recaptcha not yet available");
      return;
    }

    setLoading(true);
    try {
      const token = await executeRecaptcha("signup");
      if (!token) {
        showAlert("reCAPTCHA verification failed", "error");
        return;
      }

      const response = await fetch(`${baseUrl}/api/auth/createuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: credentials.name,
          email: credentials.email,
          phoneNumber: credentials.phoneNumber,
          password: credentials.password,
          smsEnabled: smsEnabled,
          captchaToken: token,
        }),
      });

      const json = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setCountdown(600); // 10 minutes
        setStep(4); // Move to OTP verification step
        showAlert(
          "OTPs sent to your email and phone(if enabled). Please verify.",
          "success"
        );
      } else {
        // Handle different types of errors
        if (response.status === 429) {
          showAlert(
            json.message || "Too many requests. Please try again later.",
            "error"
          );
        } else if (json.errors && json.errors.length > 0) {
          json.errors.forEach((error) => {
            showAlert(`${error.msg} (Field: ${error.path})`, "error");
          });
        } else {
          showAlert(
            json.error || "An error occurred. Please try again.",
            "error"
          );
        }
      }
    } catch (error) {
      showAlert("An error occurred. Please try again.", "error");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

 const handleErrorResponse = (json) => {
   if (json.errors && Array.isArray(json.errors)) {
     json.errors.forEach((error) => {
       showAlert(`${error.msg} (${error.path})`, "error");
     });
   } else if (json.error) {
     showAlert(json.error, "error");
   } else {
     showAlert("An error occurred. Please try again.", "error");
   }
 };

 const handleVerifyEmail = async (e) => {
   e.preventDefault();
   setLoading(true);
   try {
     const response = await fetch(`${baseUrl}/api/auth/verify-email`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ email: credentials.email, otp: emailOtp }),
     });

     const json = await response.json();

     if (response.ok) {
       if (json.success) {
         setEmailVerified(true);
         showAlert("Email verified successfully", "success");
         if (json.isFullyVerified) {
           navigate("/login");
         } else if (smsEnabled) {
           setStep(5); // Move to phone verification step
         } else {
           navigate("/login");
         }
       } else {
         handleErrorResponse(json);
       }
     } else {
       if (response.status === 429) {
         showAlert(
           json.message || "Too many requests. Please try again later.",
           "error"
         );
       } else {
         handleErrorResponse(json);
       }
     }
   } catch (error) {
     showAlert("An error occurred. Please try again.", "error");
     console.error("Verification error:", error);
   } finally {
     setLoading(false);
   }
 };

 const handleVerifyPhone = async (e) => {
   e.preventDefault();
   setLoading(true);
   try {
     const response = await fetch(`${baseUrl}/api/auth/verify-phone`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         phoneNumber: credentials.phoneNumber,
         otp: phoneOtp,
       }),
     });

     const json = await response.json();

     if (response.ok) {
       if (json.success) {
         setPhoneVerified(true);
         showAlert(json.message, "success");
         navigate("/login");
       } else {
         handleErrorResponse(json);
       }
     } else {
       if (response.status === 429) {
         showAlert(
           json.message || "Too many requests. Please try again later.",
           "error"
         );
       } else {
         handleErrorResponse(json);
       }
     }
   } catch (error) {
     showAlert("An error occurred. Please try again.", "error");
     console.error("Verification error:", error);
   } finally {
     setLoading(false);
   }
 };

 const handleResendOTP = async (type) => {
   setLoading(true);
   try {
     const response = await fetch(`${baseUrl}/api/auth/resend-otp`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         email: credentials.email,
         type: type,
       }),
     });

     const json = await response.json();

     if (response.ok) {
       if (json.message) {
         setCountdown(600);
         showAlert(`New OTP sent to your ${type}. Please check.`, "success");
       } else {
         handleErrorResponse(json);
       }
     } else {
       if (response.status === 429) {
         showAlert(
           json.message || "Too many requests. Please try again later.",
           "error"
         );
       } else {
         handleErrorResponse(json);
       }
     }
   } catch (error) {
     showAlert("An error occurred. Please try again.", "error");
     console.error("Resend OTP error:", error);
   } finally {
     setLoading(false);
   }
 };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h4 className="text-2xl text-[#567c92] text-center mb-8">
              Step 1: Personal Information
            </h4>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#6494b4] mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={credentials.name}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent transition duration-300"
                  placeholder="Enter your full name"
                />
              </div>
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
                  value={credentials.email}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent transition duration-300"
                  placeholder="Enter your email"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-[#6494b4] text-white py-3 px-4 rounded-md hover:bg-[#567c92] transition duration-300 shadow-md text-lg font-semibold"
              >
                Next
              </button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h4 className="text-2xl text-[#567c92] text-center mb-8">
              Step 2: Contact Information
            </h4>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-[#6494b4] mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={credentials.phoneNumber}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent transition duration-300"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsEnabled"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="h-4 w-4 text-[#6494b4] focus:ring-[#6494b4] border-gray-300 rounded"
                />
                <label
                  htmlFor="smsEnabled"
                  className="ml-2 block text-sm text-[#567c92]"
                >
                  Enable SMS notifications
                </label>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300 shadow-md text-lg font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-[#6494b4] text-white py-2 px-4 rounded-md hover:bg-[#567c92] transition duration-300 shadow-md text-lg font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h4 className="text-2xl text-[#567c92] text-center mb-8">
              Step 3: Set Password
            </h4>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#6494b4] mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={onChange}
                    required
                    minLength={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent transition duration-300"
                    placeholder="Create a password"
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
              <PasswordStrengthMeter password={credentials.password} />
              <div>
                <label
                  htmlFor="cpassword"
                  className="block text-sm font-medium text-[#6494b4] mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showCPassword ? "text" : "password"}
                    id="cpassword"
                    name="cpassword"
                    value={credentials.cpassword}
                    onChange={onChange}
                    required
                    minLength={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent transition duration-300"
                    placeholder="Confirm your password"
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
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-[#6494b4] focus:ring-[#6494b4] border-gray-300 rounded"
                  required
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-[#567c92]"
                >
                  I agree to the{" "}
                  <a href="#" className="text-[#6494b4] hover:underline">
                    Terms and Conditions
                  </a>
                </label>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300 shadow-md text-lg font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-[#6494b4] text-white py-2 px-4 rounded-md hover:bg-[#567c92] transition duration-300 shadow-md text-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </>
        );
      case 4:
        return (
          <>
            <h4 className="text-2xl text-[#567c92] text-center mb-8">
              Step 4: Verify Email
            </h4>
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label
                  htmlFor="emailOtp"
                  className="block text-sm font-medium text-[#6494b4] mb-1"
                >
                  Email OTP
                </label>
                <input
                  type="text"
                  id="emailOtp"
                  name="emailOtp"
                  value={emailOtp}
                  type="text"
                  id="emailOtp"
                  name="emailOtp"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent transition duration-300"
                  placeholder="Enter Email OTP"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#6494b4] text-white py-3 px-4 rounded-md hover:bg-[#567c92] transition duration-300 shadow-md text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>
          </>
        );
      case 5:
        return (
          <>
            <h4 className="text-2xl text-[#567c92] text-center mb-8">
              Step 5: Verify Phone
            </h4>
            <form onSubmit={handleVerifyPhone} className="space-y-4">
              <div>
                <label
                  htmlFor="phoneOtp"
                  className="block text-sm font-medium text-[#6494b4] mb-1"
                >
                  Phone OTP
                </label>
                <input
                  type="text"
                  id="phoneOtp"
                  name="phoneOtp"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent transition duration-300"
                  placeholder="Enter Phone OTP"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#6494b4] text-white py-3 px-4 rounded-md hover:bg-[#567c92] transition duration-300 shadow-md text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Phone"}
              </button>
            </form>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6494b4] to-[#567c92] flex">
      {/* Left Section */}
      <div className="hidden lg:flex w-1/2 bg-white items-center justify-center p-12">
        <div className="max-w-md">
          <img
            src={img}
            alt="I-Memory Logo"
            className="w-24 h-24 mx-auto mb-8"
          />
          <h2 className="text-4xl font-bold mb-6 text-[#6494b4] text-center">
            Join I-Memory Today
          </h2>
          <p className="text-xl text-[#567c92] text-center mb-8">
            Start securing your memories in the cloud with ease and confidence.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-4 text-[#6494b4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-[#567c92]">Free account creation</span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-4 text-[#6494b4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <span className="text-[#567c92]">
                Instant access to cloud storage
              </span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-4 text-[#6494b4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
              <span className="text-[#567c92]">Secure and private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex-grow flex items-center justify-center px-6">
          <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-center mb-8">
              <img src={img} alt="I-Memory Logo" className="h-12 mr-3" />
              <h3 className="text-3xl font-bold text-[#6494b4]">I-Memory</h3>
            </div>
            {/* Step Progress Indicator */}
            <div className="flex justify-between items-center mb-8">
              <div className="w-full h-1 bg-gray-300 rounded-full">
                <div
                  className={`h-1 bg-[#6494b4] rounded-full`}
                  style={{ width: `${(step / 5) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between w-full">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${
                      step >= s ? "bg-[#6494b4]" : "bg-gray-300"
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
            {renderStep()}
            {otpSent && (
              <div className="mt-4 text-center">
                {countdown > 0 ? (
                  <p className="text-[#567c92]">
                    Resend OTP in {Math.floor(countdown / 60)}:
                    {countdown % 60 < 10 ? "0" : ""}
                    {countdown % 60}
                  </p>
                ) : (
                  <div>
                    <button
                      onClick={() => handleResendOTP("email")}
                      className="text-[#6494b4] hover:underline mr-4"
                      disabled={loading}
                    >
                      Resend Email OTP
                    </button>
                    {smsEnabled && (
                      <button
                        onClick={() => handleResendOTP("phone")}
                        className="text-[#6494b4] hover:underline"
                        disabled={loading}
                      >
                        Resend Phone OTP
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            <p className="mt-8 text-center text-sm text-[#567c92]">
              Already have an account?{" "}
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
      </div>
    </div>
  );
};

export default Signup;
