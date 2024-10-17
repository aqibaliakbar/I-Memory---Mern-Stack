const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;

// SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Send email function
async function sendEmail(to, subject, text) {
  const msg = {
    to,
    from: process.env.SENDGRID_VERIFIED_SENDER,
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// ROUTE 1: Create a User
router.post(
  "/createuser",
  [
    body("name", "Enter a Valid Name").isLength({ min: 3 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success, error: "Email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(req.body.password, salt);

      const otp = generateOTP();
      const otpExpires = Date.now() + 600000; // 10 minutes

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,
        verificationOTP: otp,
        verificationOTPExpires: otpExpires,
      });

      // Send verification email
      await sendEmail(
        user.email,
        "Email Verification",
        `Your verification OTP is: ${otp}. It will expire in 10 minutes.`
      );

      success = true;
      res.json({
        success,
        message:
          "User created successfully. Please check your email for verification OTP.",
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ROUTE 2: Verify Email
router.post(
  "/verify-email",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("otp", "Enter a Valid OTP").isLength({ min: 6, max: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, otp } = req.body;
      const user = await User.findOne({
        email,
        verificationOTP: otp,
        verificationOTPExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      user.isVerified = true;
      user.verificationOTP = undefined;
      user.verificationOTPExpires = undefined;
      await user.save();

      const authToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET);
      res.json({ success: true, authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ROUTE 3: Login
router.post(
  "/login",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password Cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: "Please try to login with correct credentials" });
      }

      if (!user.isVerified) {
        return res
          .status(400)
          .json({ errors: "Please verify your email before logging in" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res.status(400).json({
          success,
          errors: "Please try to login with correct credentials",
        });
      }

      const data = { user: { id: user.id } };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ROUTE 4: Forgot Password
router.post(
  "/forgot-password",
  [body("email", "Enter a Valid Email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const otp = generateOTP();
      user.resetPasswordOTP = otp;
      user.resetPasswordOTPExpires = Date.now() + 600000; // 10 minutes
      await user.save();

      await sendEmail(
        user.email,
        "Password Reset OTP",
        `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
      );

      res.json({ message: "Password reset OTP sent to your email" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ROUTE 5: Reset Password
router.post(
  "/reset-password",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("otp", "Enter a Valid OTP").isLength({ min: 6, max: 6 }),
    body("newPassword", "Password must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, otp, newPassword } = req.body;
      const user = await User.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordOTPExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save();

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ROUTE 6: Resend OTP
router.post(
  "/resend-otp",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("type", "Invalid OTP type").isIn(["verification", "reset"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, type } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const otp = generateOTP();
      const otpExpires = Date.now() + 600000; // 10 minutes

      if (type === "verification") {
        user.verificationOTP = otp;
        user.verificationOTPExpires = otpExpires;
      } else {
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = otpExpires;
      }

      await user.save();

      await sendEmail(
        user.email,
        type === "verification"
          ? "Email Verification OTP"
          : "Password Reset OTP",
        `Your new OTP is: ${otp}. It will expire in 10 minutes.`
      );

      res.json({ message: "New OTP sent successfully" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

module.exports = router;
