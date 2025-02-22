const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String, // ✅ Optional: Only needed for email-password users
    },
    googleId: {
      type: String, // ✅ New Field: Stores Google ID for OAuth users
      unique: true,
      sparse: true, // ✅ Allows `null` values while keeping uniqueness
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
