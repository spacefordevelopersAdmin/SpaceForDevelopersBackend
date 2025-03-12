const express = require("express");
const router = express.Router();
const User = require("../model/user.js"); // Ensure correct import path
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { sendEmail } = require("../Util/Email.js");
const passport = require('passport');
const {  verifyOtp } = require("../Util/verifyOtp.js");
const { sendOtpByEmail } = require("../Util/sendOtp.js");


const requireAuth = (req, res, next) => {
  console.log("Session Data:", req.session);
  console.log(req.user);
  console.log(req.isAuthenticated());
  
  if (req.isAuthenticated() && req.user) {
    return next(); // User is authenticated, proceed
  }

  return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
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

    await sendEmail(email, username,undefined,"signup");

    res.status(201).json({
      success: true,
      message: "You have been Signed Up successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Not able to signup", error: error.message });
  }
});


router.post('/login', (req, res, next) => {
  
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({success:false, message: 'Internal Server Error' });
    if (!user) return res.status(401).json({ success:false, message: info.message });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Internal Server Error' });
      res.status(200).json({ success:true, message: 'Login successful', user: { id: user._id, name: user.name, email: user.email,role:user.role } });
    });
  })(req, res, next);


});


router.get("/protected/profile", requireAuth, async (req, res) => {
  try {
    
    const user=req.user
    

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true,message:"user Found", user });

  } catch (error) {
    console.log(error);
    
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

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/signup` }),
  (req, res) => {
  
    res.redirect(`${process.env.FRONTEND_URL}`); // Redirect to frontend
  }
);

router.post("/logout", (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Logout failed" });
      }

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Logout failed" });
        }
        
        res.clearCookie("connect.sid"); // Clears the session cookie
        res.status(200).json({ success: true, message: "Logout successful" });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/send-otp", sendOtpByEmail);

router.post("/verify-otp", verifyOtp);


module.exports = router;
