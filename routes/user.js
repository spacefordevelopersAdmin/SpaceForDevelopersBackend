const express = require("express");
const router = express.Router();
const User = require("../model/user"); // Ensure correct import path
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {sendEmail} =require('../Util/Email.js')

// ✅ Route to register a new user
router.post("/signup", async (req, res) => {
    const formData = req.body;
    const {username,email,password}=formData;    
    
    
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user with hashed password
        const newUser = await User.create({
            name:username,
            email,
            password: hashedPassword,
        });
        
        await sendEmail(email,username) 
        
        res.status(201).json({success:true, message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({success:false,message:'Not able to signup', error: error.message });
    }
});

// ✅ Route for user login
router.post("/login", async (req, res) => {
    const formData = req.body;

    const {email,password}=formData;
    // console.log(formData);
    
    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
       
        
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("access_token_space", token, {
            httpOnly: true,     // Secure, prevents JavaScript access
            secure: false,      // Should be false on localhost (set true for HTTPS in production)
            sameSite: "lax",    // Allow cross-site requests (change to 'none' for cross-domain)
            path: "/",          // Ensure cookie is available throughout the site
        }
        ).status(200).json({success:true, message: "Login successful" });
    } catch (error) {
        res.status(500).json({success:false,message:"Trouble While Logging" ,error: error.message });
    }
});

// Middleware to check token
const verifyToken = (req, res, next) => {
    
    const token = req.cookies?.access_token_space; // Extract from cookies
    console.log(token);
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized. No token provided." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Store user data in req.user
      next(); // Proceed to next middleware
    } catch (error) {
      return res.status(401).json({ success: false, message: "Unauthorized. Invalid or expired token." });
    }
  };
  

// Use the middleware in your route
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, message: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/protected/profile", verifyToken, async (req, res) => {
    try {
      // ✅ Fetch user using email stored in JWT token
      const user = await User.findOne({ email: req.user.email }).select("-password"); // Exclude password
        console.log(user);
        
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
router.post("/Form/BookingSession",verifyToken, async (req, res) => {
    const { fullName, email, phoneNumber, experienceLevel, preferredDate, preferredTime, learningGoals, sessionMode } = req.body;

    if (!fullName || !email || !phoneNumber || !experienceLevel || !preferredDate || !preferredTime || !learningGoals || !sessionMode) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const formData = {
            fullName,
            email,
            phoneNumber,
            experienceLevel,
            preferredDate,
            preferredTime,
            learningGoals,
            sessionMode
        };

        await writeToGoogleSheets(formData);
        
        return res.json({ success: "Your booking has been recorded!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong", err: error });
    }
});

router.post("/logout", (req, res) => {
    try {
      res.clearCookie("access_token_space", { httpOnly: true, secure: true, sameSite: "strict" }); // Clear auth cookie
      return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });


module.exports = router;