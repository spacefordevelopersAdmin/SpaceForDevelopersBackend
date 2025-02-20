require("dotenv").config();
const { Resend } = require("resend");

const DOMAIN_EMAIL = "noreply@spacefordevelopers.in";
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(receiverAddress, userName) {
  try {
    console.log("Sending email...");

    const emailHtml = `
          <!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Space for Developers</title>
</head>

<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#f4f4f4">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff"
          style="margin: 20px auto; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          
          <!-- Logo Image -->
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/diht8xvzr/image/upload/v1740070825/SD_weroup.jpg" 
                   alt="Wero Up" width="150" style="display: block; margin-bottom: 20px;">
            </td>
          </tr>

          <!-- Welcome Text -->
          <tr>
            <td align="center">
              <h2 style="color: #333;">🚀 Welcome to Space for Developers – Let’s Build & Innovate!</h2>
              <p style="color: #555; font-size: 16px;">Dear <strong>${userName}</strong>,</p>
              <p style="color: #555; font-size: 16px;">Thank you for signing up for <strong>Space for Developers!</strong> 🎉</p>
            </td>
          </tr>

          <!-- Features List -->
          <tr>
            <td>
              <h3 style="color: #333;">🔥 What You Get as a Member:</h3>
              <ul style="color: #555; font-size: 16px;">
                <li>✅ <strong>1-on-1 Mentorship</strong> – Learn directly from experts.</li>
                <li>✅ <strong>Hands-on Projects</strong> – Work on real-world challenges.</li>
                <li>✅ <strong>Community & Networking</strong> – Connect with peers & professionals.</li>
                <li>✅ <strong>Career Support & Guidance</strong> – Stay ahead in the tech industry.</li>
                <li>✅ <strong>Affiliate Program</strong> – Earn 10% commission on every course referral!</li>
              </ul>
            </td>
          </tr>

          <!-- Get Started Section -->
          <tr>
            <td>
              <h3 style="color: #333;">🛠 Get Started Now:</h3>
              <ol style="color: #555; font-size: 16px;">
                <li>1️⃣ <strong>Access Your Dashboard</strong> – <a href="https://www.spacefordevelopers.in/signup" style="color: #007bff; text-decoration: none;">Login Here</a></li>
                <li>2️⃣ <strong>Explore Courses & Resources</strong> – Check out available programs.</li>
                <li>3️⃣ <strong>Join Our Community</strong> – Engage in discussions & collaborations. <em>(Coming Soon!)</em></li>
              </ol>
            </td>
          </tr>

          <!-- Contact Information -->
          <tr>
            <td>
              <p style="color: #555; font-size: 16px;">
                If you have any questions, contact us at 
                <a href="mailto:spacefordevelopers@gmail.com" style="color: #007bff; text-decoration: none;">
                  spacefordevelopers@gmail.com
                </a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <p style="font-size: 14px; color: #333;"><strong>Best Regards,</strong><br>
                Siddhant Sharma<br>Founder, Space for Developers</p>
            </td>
          </tr>

          <!-- Social & Website Links -->
          <tr>
            <td align="center" style="padding-top: 10px;">
              <p>
                🌐 <a href="https://www.spacefordevelopers.in" style="color: #007bff; text-decoration: none;">Website</a> |
                🔗 <a href="https://www.linkedin.com/in/siddhantsharma001" style="color: #007bff; text-decoration: none;">LinkedIn</a> |
                📩 <a href="mailto:spacefordevelopers@gmail.com" style="color: #007bff; text-decoration: none;">Support Email</a>
              </p>
            </td>
          </tr>

          <!-- Copyright Footer -->
          <tr>
            <td align="center" style="padding-top: 15px; border-top: 1px solid #ddd;">
              <p style="font-size: 14px; color: #555;">© 2025 Space For Developers. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>

</html>
`;


    const { data, error } = await resend.emails.send({
      from: `Space For Developers <${DOMAIN_EMAIL}>`,
      to: [receiverAddress],
      subject: "Welcome to Space For Developers!",
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending email:", error);
      return;
    }

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Error in sending email:", error);
  }
}

module.exports = { sendEmail };
