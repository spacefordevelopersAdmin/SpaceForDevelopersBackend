require("dotenv").config();
const { Resend } = require("resend");

const DOMAIN_EMAIL = "noreply@spacefordevelopers.in";
const resend = new Resend(process.env.RESEND_API_KEY);

// Temporary store (Use Redis or DB for production)
const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Ensures 6 digits
}

async function sendOtpByEmail(req, res) {
  try {
    const { email } = req.body; // Get user email
    console.log(req.body);

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otp = generateOtp(); // Generate OTP
    otpStore.set(email, otp); // Save OTP in temporary store

    // HTML email template
    const HTML = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2>OTP Verification</h2>
        <p>Your One-Time Password (OTP) for Space for Developers sign-up is:</p>
        <h1 style="font-size: 24px; letter-spacing: 4px; font-weight: bold;">${otp}</h1>
        <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <strong>Space for Developers Team</strong>
      </div>
    `;

    // Send email
    const { data, error } = await resend.emails.send({
      from: `Space For Developers <${DOMAIN_EMAIL}>`,
      to: [email],
      subject: "Your One-Time Password (OTP) for Space For Developers Signup",
      html: HTML,
    });

    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ success: false, message: "Failed to send OTP" });
    }

    console.log("OTP sent successfully:", data);
    return res.status(200).json({ success: true, message: "OTP sent successfully via Gmail" });

  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = { sendOtpByEmail, otpStore };
