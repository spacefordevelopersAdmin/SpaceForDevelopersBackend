const express = require("express");
const router = express.Router();
const User = require("../model/user.js"); // Ensure correct import path
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { sendEmail } = require("../Util/Email.js");
const passport = require('passport');
const {  verifyOtp } = require("../Util/verifyOtp.js");
const { sendOtpByEmail } = require("../Util/sendOtp.js");

const admin=require("firebase-admin");

const requireAuth = (req, res, next) => {
  // console.log("Session Data:", req.session);
  // console.log(req.user);
  // console.log(req.isAuthenticated());
  
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

    // await sendEmail(email, fullName, phoneNumber, "BookingSession");
    await sendAdminNotification(
      "New Session Booked",
      `A new session has been booked with ${fullName}. Contact: ${phoneNumber}. Check the Google sheets for more details.`
    );
    
    res.status(200).json({ success: true, message: "Email has been sent for BookingSession" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


async function sendAdminNotification(title,message) {
  try {
    const adminsWithFcmToken = await User.find({
      role: "admin",
      fcm_token: { $exists: true, $ne: null },
    });

    if (!adminsWithFcmToken || adminsWithFcmToken.length === 0) {
      console.error("No admins with FCM tokens found");
      return;
    }

    // Extract FCM tokens into an array
    
    const fcmTokens = adminsWithFcmToken.map((admin) => admin.fcm_token);
    // console.log(fcmTokens);
    
    // Prepare multicast message (sends to multiple tokens in one request)
    const pushMessage = {
      notification: {
        title:title,
        body: message,
      },
      tokens: fcmTokens, // Array of FCM tokens
    };

    // Send multicast notification
    const response = await admin.messaging().sendEachForMulticast(pushMessage);
    // console.log("Notifications sent successfully:", response);

    // Log any failures (optional)
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to ${fcmTokens[idx]}: ${resp.error}`);
        }
      });
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
}

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

router.post("/save-fcm-token",async (req,res)=>{
  try {
    const { token ,email} = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }
    console.log("Received Admin FCM Token:", token);
    const k=await User.updateOne({ role: "admin" ,email:email}, { fcm_token: token }, { upsert: true });
    
    res.status(200).json({ success: true, message: "Token saved successfully" });
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
})


module.exports = router;
