require("dotenv").config();
const { Resend } = require("resend");

const DOMAIN_EMAIL = "noreply@spacefordevelopers.in";
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(receiverAddress, userName) {
  try {
    console.log("Sending email...");

    const emailHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
    <div style="text-align: center; padding: 10px;">
      <img src="https://wwww.spacefordevelopers.in/LOGO2.jpg" alt="Space For Developers" style="width: 150px;"/>
    </div>
    
    <h2 style="color: #333; text-align: center;">Welcome to Space For Developers, ${userName}!</h2>
    
    <p style="color: #555; font-size: 16px; text-align: center;">
      We are absolutely thrilled to have you join our community! 🚀  
      At <strong>Space For Developers</strong>, we believe in **innovation, collaboration, and pushing boundaries**—and we can't wait to see what you'll build with us.
    </p>

    <p style="color: #555; font-size: 16px; text-align: center;">
      You're now part of a growing network of passionate developers, creators, and visionaries who are shaping the future of technology.  
      This is just the beginning of an exciting journey, and we are here to support you every step of the way.
    </p>

    <p style="color: #777; font-size: 14px; text-align: center;">
      If you ever have questions, ideas, or just want to connect, feel free to reach out—we’d love to hear from you!
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    
    <p style="text-align: center; color: #888; font-size: 12px;">
      &copy; ${new Date().getFullYear()} Space For Developers. All rights reserved.
    </p>
  </div>
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
