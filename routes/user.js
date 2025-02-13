const express = require("express");
const router = express.Router();
const User = require("../model/user"); // Ensure correct import path
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT, GoogleAuth } = require("google-auth-library");
const { google } = require('googleapis');
const fs=require('fs')
const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS, "base64").toString("utf8"));

// const credentials = JSON.parse(fs.readFileSync("service-account.json", "utf8")); //run this in dev mode

const auth = new GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

async function writeToGoogleSheets(name, email, message) {
    try {
        const auth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
  
        const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0]; // First sheet
  
        // Ensure headers are set
        const headers = ["Name", "Email", "Message"];
        await sheet.setHeaderRow(headers);
  
        // Add new row with contact details
        await sheet.addRow({ Name: name, Email: email, Message: message });
  
        console.log("Contact details added to Google Sheets");
    } catch (error) {
        console.error("Error writing to Google Sheets:", error);
    }
}

require("dotenv").config();

// ✅ Route to register a new user
router.post("/createUser", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
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
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({success:true, message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({success:false,message:'Not able to signup', error: error.message });
    }
});

// ✅ Route for user login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Find the user by email
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

        res.cookie("token",token,{
            httpOnly:true,
            sameSite:"strict",

        }).status(200).json({success:true, message: "Login successful", token });
    } catch (error) {
        res.status(500).json({success:false,message:"Trouble While Logging" ,error: error.message });
    }
});

// ✅ Route to get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({success:true,message:users});
    } catch (error) {
        res.status(500).json({success:false, error: error.message });
    }
});


router.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;
    console.log("eriting");

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {

        await writeToGoogleSheets(name, email, message);        
        return res.json({ success: "Your message has been recorded!" });
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({ error: "Something went wrong",err:error });
    }
});



module.exports = router;
