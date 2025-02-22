const express = require("express");
const router = express.Router();
const User = require("../model/user"); // Ensure correct import path
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { sendEmail } = require("../Util/Email.js");
const passport = require("passport");

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
  }
  next(); // User is authenticated, proceed
};

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: username,
      email,
      password: hashedPassword,
    });

    await sendEmail(email, username, "signup");

    res.status(201).json({
      success: true,
      message: "You have been Signed Up successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Not able to signup", error: error.message });
  }
});



router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // ✅ Save user session
    req.session.user = {
      id: user._id,
      email: user.email,
      role:user.role
    };

    res.status(200).json({ success: true, message: "Login successful", user: req.session.user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Trouble While Logging", error: error.message });
  }
});

router.get("/protected/profile", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true,message:"user Found", user });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



router.post("/confirmBookingSession", async (req, res) => {
  try {
    const { phoneNumber, email, fullName } = req.body;

    await sendEmail(email, fullName, phoneNumber, "BookingSession");

    res.status(200).json({ success: true, message: "Email has been sent for BookingSession" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get("/auth/google",passport.authenticate("google",{scope:["profile","email"] }));
router.get("/auth/google/callback",
  passport.authenticate("google",{failureRedirect:"/signup"}),
  (req,res)=>{
    req.session.user={
      id:req.user._id,
      email:req.user.email,
      role:req.user.role
    }
    res.redirect(`${process.env.FRONTEND_URL}`)
  }
)

router.post("/logout", (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({success:false, message: "Logout failed" });
      }
      
      res.clearCookie("connect.sid"); // Clears the session cookie
      
      res.status(200).json({success:true, message: "Logout successful" });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
