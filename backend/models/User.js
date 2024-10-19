const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: false, // Changed from required: true
    unique: true,
    sparse: true, // Added sparse index
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationOTP: String,
  phoneVerificationOTP: String,
  verificationOTPExpires: Date,
  resetPasswordOTP: String,
  resetPasswordOTPExpires: Date,
  smsNotificationsEnabled: {
    type: Boolean,
    default: false, // Changed from default: true
  },
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
