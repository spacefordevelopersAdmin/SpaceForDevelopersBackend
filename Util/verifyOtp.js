const { otpStore } = require("./sendOtp");

async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body; // Get email and OTP
    console.log(req.body);
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const correctOtp = otpStore.get(email); // Retrieve OTP from store
    
    if (!correctOtp) {
      return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    if (otp !== correctOtp) {
      return res.status(400).json({ success: false, message: "Incorrect OTP" });
    }

    otpStore.delete(email); // Remove OTP after successful verification

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = { verifyOtp };
