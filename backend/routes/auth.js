const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const rateLimit = require("express-rate-limit");
const axios = require("axios");

const JWT_SECRET = process.env.JWT_SECRET;

// SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configure AWS SNS
const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Rate limiting setup
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message:
    "Too many accounts created from this IP, please try again after an hour",
  statusCode: 429,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // start blocking after 5 requests
  message:
    "Too many OTP requests from this IP, please try again after 15 minutes",
  statusCode: 429,
});

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

// Send SMS function
async function sendSMS(phoneNumber, message) {
  const params = {
    Message: message,
    PhoneNumber: phoneNumber,
  };

  try {
    const command = new PublishCommand(params);
    const response = await snsClient.send(command);
    console.log("SMS sent successfully", response);
    return response;
  } catch (error) {
    console.error("Error sending SMS:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

// Verify CAPTCHA
async function verifyCaptcha(captchaToken) {
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;

  try {
    const response = await axios.post(verifyUrl);
    return response.data.success;
  } catch (error) {
    console.error("Error verifying CAPTCHA:", error);
    return false;
  }
}

// ROUTE 1: Create a User
router.post(
  "/createuser",
  createAccountLimiter,
  [
    body("name", "Enter a Valid Name").isLength({ min: 3 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({
      min: 5,
    }),
    body("phoneNumber", "Enter a valid phone number").isMobilePhone(),
    body("captchaToken", "CAPTCHA token is required").notEmpty(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      // Verify CAPTCHA
      const captchaVerified = await verifyCaptcha(req.body.captchaToken);
      if (!captchaVerified) {
        return res
          .status(400)
          .json({ success, error: "CAPTCHA verification failed" });
      }

      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success, error: "Email already exists" });
      }

      user = await User.findOne({ phoneNumber: req.body.phoneNumber });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "Phone number already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(req.body.password, salt);

      const emailOTP = generateOTP();
      const phoneOTP = generateOTP();
      const otpExpires = Date.now() + 600000; // 10 minutes

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: securePassword,
        emailVerificationOTP: emailOTP,
        phoneVerificationOTP: phoneOTP,
        verificationOTPExpires: otpExpires,
      });

      // Send verification email
      await sendEmail(
        user.email,
        "Email Verification",
        `Your email verification OTP is: ${emailOTP}. It will expire in 10 minutes.`
      );

      // Send verification SMS
      await sendSMS(
        user.phoneNumber,
        `Your I-Memory phone verification OTP is: ${phoneOTP}. It will expire in 10 minutes.`
      );

      success = true;
      res.json({
        success,
        message:
          "User created successfully. Please check your email and phone for verification OTPs.",
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
  otpLimiter,
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
        emailVerificationOTP: otp,
        verificationOTPExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      user.isEmailVerified = true;
      user.emailVerificationOTP = undefined;
      await user.save();

      res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ROUTE 3: Verify Phone
router.post(
  "/verify-phone",
  otpLimiter,
  [
    body("phoneNumber", "Enter a valid phone number").isMobilePhone(),
    body("otp", "Enter a Valid OTP").isLength({ min: 6, max: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phoneNumber, otp } = req.body;
      const user = await User.findOne({
        phoneNumber,
        phoneVerificationOTP: otp,
        verificationOTPExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      user.isPhoneVerified = true;
      user.phoneVerificationOTP = undefined;
      await user.save();

      if (user.isEmailVerified && user.isPhoneVerified) {
        return res.json({
          success: true,
          message: "Phone verified successfully. You can now log in.",
          isFullyVerified: true,
        });
      }

      res.json({ success: true, message: "Phone verified successfully" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ROUTE 4: Login
router.post(
  "/login",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password Cannot be blank").exists(),
    body("captchaToken", "CAPTCHA token is required").notEmpty(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password, rememberMe } = req.body;
    try {
      // Verify CAPTCHA
      const captchaVerified = await verifyCaptcha(req.body.captchaToken);
      if (!captchaVerified) {
        return res.status(400).json({ error: "CAPTCHA verification failed" });
      }

      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: "Please try to login with correct credentials" });
      }

      if (!user.isEmailVerified || !user.isPhoneVerified) {
        return res.status(400).json({
          errors: "Please verify your email and phone before logging in",
        });
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
      const tokenExpiration = rememberMe ? "30d" : "1d"; // 30 days if remember me, else 1 day
      const authToken = jwt.sign(data, JWT_SECRET, {
        expiresIn: tokenExpiration,
      });

      success = true;
      res.json({ success, authToken, expiresIn: tokenExpiration });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ROUTE 5: Forgot Password
router.post(
  "/forgot-password",
  otpLimiter,
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("captchaToken", "CAPTCHA token is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Verify CAPTCHA
      const captchaVerified = await verifyCaptcha(req.body.captchaToken);
      if (!captchaVerified) {
        return res.status(400).json({ error: "CAPTCHA verification failed" });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const otp = generateOTP();
      user.resetPasswordOTP = otp;
      user.resetPasswordOTPExpires = Date.now() + 600000; // 10 minutes
      await user.save();

      // Send OTP via email
      await sendEmail(
        user.email,
        "Password Reset OTP",
        `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
      );

      // Send OTP via SMS
      if (user.smsNotificationsEnabled) {
        await sendSMS(
          user.phoneNumber,
          `Your I-Memory password reset OTP is: ${otp}. It will expire in 10 minutes.`
        );
      }

      res.json({
        message: "Password reset OTP sent to your email and phone (if enabled)",
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ROUTE 6: Reset Password
router.post(
  "/reset-password",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("otp", "Enter a Valid OTP").isLength({ min: 6, max: 6 }),
    body("newPassword", "Password must be at least 5 characters").isLength({
      min: 5,
    }),
    body("captchaToken", "CAPTCHA token is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Verify CAPTCHA
      const captchaVerified = await verifyCaptcha(req.body.captchaToken);
      if (!captchaVerified) {
        return res
          .status(400)
          .json({ error: "CAPTCHA verification failed. Please try again." });
      }

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

      // Send confirmation email
      await sendEmail(
        user.email,
        "Password Reset Successful",
        "Your password has been successfully reset. If you did not initiate this change, please contact our support team immediately."
      );

      // Send confirmation SMS
      if (user.smsNotificationsEnabled) {
        await sendSMS(
          user.phoneNumber,
          "Your I-Memory password has been successfully reset. If you did not initiate this change, please contact our support team immediately."
        );
      }

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ROUTE 7: Resend OTP
router.post(
  "/resend-otp",
  otpLimiter,
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("type", "Invalid OTP type").isIn(["email", "phone", "reset"]),
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

      if (type === "email") {
        user.emailVerificationOTP = otp;
        user.verificationOTPExpires = otpExpires;
        await sendEmail(
          user.email,
          "Email Verification OTP",
          `Your new email verification OTP is: ${otp}. It will expire in 10 minutes.`
        );
      } else if (type === "phone") {
        user.phoneVerificationOTP = otp;
        user.verificationOTPExpires = otpExpires;
        await sendSMS(
          user.phoneNumber,
          `Your new I-Memory phone verification OTP is: ${otp}. It will expire in 10 minutes.`
        );
      } else {
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = otpExpires;
        await sendEmail(
          user.email,
          "Password Reset OTP",
          `Your new password reset OTP is: ${otp}. It will expire in 10 minutes.`
        );
        if (user.smsNotificationsEnabled) {
          await sendSMS(
            user.phoneNumber,
            `Your new I-Memory password reset OTP is: ${otp}. It will expire in 10 minutes.`
          );
        }
      }

      await user.save();

      res.json({
        message: `New OTP sent successfully for ${type} verification`,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ROUTE 8: Opt-out of SMS notifications
router.post("/opt-out-sms", fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.smsNotificationsEnabled = false;
    await user.save();

    res.json({ message: "Successfully opted out of SMS notifications" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server error" });
  }
});

// ROUTE 9: Get user details
router.get("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});




module.exports = router;
