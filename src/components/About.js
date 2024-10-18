import React from "react";
import { motion } from "framer-motion";
import {
  FaCloud,
  FaLock,
  FaMobile,
  FaEnvelope,
  FaSms,
  FaGoogle,
  FaImage,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logout } from "../SessionManager/auth";
// import { SiAmazonsns, SiCloudinary } from "react-icons/si";

const Thumbnail = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate("/login");
    };
  return (
    <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-[#6494b4] to-[#567c92]">
      {/* Message for non-responsive view (visible below 'lg') */}
      <div className="text-white text-center text-wrap font-bold text-5xl lg:hidden">
        Not responsive below Large Screens.
      </div>

      {/* Hide the entire card below 'lg' */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-2xl p-8 max-w-3xl w-full hidden lg:block"
      >
        <div className="flex items-center justify-center mb-6">
          <FaCloud className="text-6xl text-[#6494b4] mr-4" />
          <h1 className="text-4xl font-bold text-[#567c92]">I-Memory</h1>
        </div>

        <p className="text-xl text-center text-[#567c92] mb-8">
          Secure Cloud Storage with Advanced Authentication
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <FeatureCard
            icon={FaLock}
            title="OTP Verification"
            description="Secure login with email and SMS OTP"
          />
          <FeatureCard
            icon={FaEnvelope}
            title="Email OTP"
            description="SendGrid powered email verification"
          />
          <FeatureCard
            icon={FaSms}
            title="SMS OTP"
            description="Amazon SNS for reliable SMS delivery"
          />
          <FeatureCard
            icon={FaImage}
            title="Image Upload"
            description="Cloudinary integration for image storage"
          />
          <FeatureCard
            icon={FaGoogle}
            title="reCAPTCHA"
            description="Google reCAPTCHA for enhanced security"
          />
          <FeatureCard
            icon={FaMobile}
            title="Resend OTP"
            description="Easy OTP resend functionality"
          />
        </div>

        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#6494b4] text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-[#567c92] transition duration-300"
            onClick={handleLogout}
          >
            Explore Secure Authentication
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, subIcon: SubIcon }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-gray-50 rounded-lg p-6 shadow-md relative overflow-hidden"
    >
      <Icon className="text-4xl text-[#6494b4] mb-4" />
      <h3 className="text-lg font-semibold text-[#567c92] mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      {SubIcon && (
        <SubIcon className="absolute bottom-2 right-2 text-2xl text-gray-400 opacity-50" />
      )}
    </motion.div>
  );
};

export default Thumbnail;
