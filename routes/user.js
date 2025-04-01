const express = require("express");
const router = express.Router();
const User = require("../model/user.js"); // Ensure correct import path
const { Resend } = require("resend");
const { appendToSheet } = require("../Util/googleSheets.js");

const bcrypt = require("bcryptjs");
require("dotenv").config();
const { sendEmail } = require("../Util/Email.js");
const passport = require('passport');
const { verifyOtp } = require("../Util/verifyOtp.js");
const { sendOtpByEmail } = require("../Util/sendOtp.js");

const admin = require("firebase-admin");

const requireAuth = (req, res, next) => {
  // console.log("Session Data:", req.session);
  // console.log(req.user);
  // console.log(req.isAuthenticated());

  if (req.isAuthenticated() && req.user) {
    return next(); // User is authenticated, proceed
  }

  return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
};

router.post("/waitlist/send-email", async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: "Username and email are required." });
  }

  try {
    res.status(200).json({success:true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success:false,error: "Failed to send email." });
  }
});



// const sendVOSCOmail = async (recipients) => {
//   const resend = new Resend("re_UWPxAxM5_7iWSszjD5ssz8VG25oGWdXap");
//   const DOMAIN_EMAIL = "noreply@vosco.io";
//   const failedEmails = []; // Array to track failed emails

//   try {
//     for (const recipient of recipients) {
//       const { first_name, email } = recipient;

//       const EMAILCONTENT = ` 
// <!DOCTYPE html>
// <html>
// <head>
//   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Welcome to VosCo!</title>
// </head>
// <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #111; color: #fff;">
//   <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#111">
//     <tr>
//       <td align="center">
//         <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#000"
//           style="margin: 40px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);">
          
//           <!-- Header -->
//           <tr>
//             <td align="center">
//               <h2 style="color: #fff; font-size: 24px; margin-bottom: 10px;">Welcome to VosCo!</h2>
//               <p style="color: #ccc; font-size: 16px; margin-top: 0;">We're thrilled to have you here.</p>
//             </td>
//           </tr>

//           <!-- Message Content -->
//           <tr>
//             <td>
//               <p style="color: #ddd; font-size: 16px; line-height: 1.6;">Hey <strong>${first_name}</strong>,</p>
//               <p style="color: #ddd; font-size: 16px; line-height: 1.6;">I saw you signed up for the VosCo waiting list—awesome! 🎉</p>
//               <p style="color: #ddd; font-size: 16px; line-height: 1.6;">
//                 If you'd like to be a beta user, meaning early access before anyone else, special perks, and direct contact with me and the team, just hit the button below:
//               </p>
//               <p align="center">
//                 <a href="https://www.instagram.com/renard.wb/" 
//                    style="display: inline-block; background-color: #090c14; color: #dc2626; border: 1px solid #888; padding: 12px 20px; 
//                    font-size: 16px; border-radius: 5px; text-decoration: none; font-weight: bold;">
//                    DM me on Instagram
//                 </a>
//               </p>

//               <p style="color: #ddd; font-size: 16px; line-height: 1.6;">
//                 And if not, no worries! You'll still be able to join once we go live, and you'll be the first to know.  
//               </p>
//               <p style="color: #ddd; font-size: 16px; line-height: 1.6;">
//                 No spam from us—this is the only email you'll get until we're live. Just a quick heads-up when it's time.  
//               </p>
//               <p style="color: #fff; font-size: 16px; font-weight: bold;">Thanks for being part of VosCo! 🚀</p>
//             </td>
//           </tr>

//           <!-- Footer -->
//           <tr>
//             <td align="center" style="padding-top: 20px; border-top: 1px solid #333;">
//               <p style="font-size: 14px; color: #aaa;margin-bottom: 4px;"><strong>See you soon,</strong><br>
//                 <span style="color: #fff; font-weight: bold;">Renard & The VosCo Team</span></p>
//             </td>
//           </tr>

//         </table>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>
// `;

//       const { error } = await resend.emails.send({
//         from: `VosCo Team <${DOMAIN_EMAIL}>`,
//         to: [email],
//         subject: "You're on the VosCo Waiting List! 🚀",
//         html: EMAILCONTENT,
//       });

//       if (error) {
//         console.error(`Error sending email to ${email}:`, error);
//         failedEmails.push({ email, error: error.message }); // Track failed emails
//       }
//     }

//     return { success: true, message: "Emails processed", failedEmails };
//   } catch (error) {
//     console.error("Error in sending bulk emails:", error);
//     throw error;
//   }
// };

// // Endpoint to send bulk emails
// router.post("/send-bulk-emails", async (req, res) => {
//   try {
//     // Hardcoded list of recipients
//     const recipients = [
//       { first_name: "test", email: "renardwolfensberger@gmail.com" },
//       // { first_name: "renard", email: "renardwolfensberger@icloud.com" },
//       // { first_name: "Rico", email: "rico.klinger05@gmail.com" },
//       // { first_name: "Louis", email: "louisdelaisse@gmail.com" },
//       // { first_name: "Jaxson", email: "jaxsonknight6@gmail.com" },
//       // { first_name: "Suleiman", email: "mwaijegakelvin@gmail.com" },
//       // { first_name: "Ilias", email: "iliasnikolaou212@gmail.com" },
//       // { first_name: "Enric", email: "evilabaiget@gmail.com" },
//       // { first_name: "test", email: "renardwolfensberger@gmail.com" },
//       // { first_name: "Enzo", email: "enz.ducros@gmail.com" },
//       // { first_name: "Ilija", email: "business.ilijarado@gmail.com" },
//       // { first_name: "hdiuuhv", email: "gueid234@gmail.com" },
//       // { first_name: "renard", email: "renardwolfensberger@icloud.com" },
//       // { first_name: "Rishul", email: "rishul@reachroot.xyz" },
//       // { first_name: "Kirthik", email: "kirthik200324@gmail.com" },
//       // { first_name: "ebeds", email: "heroenes612@gmail.com" },
//       // { first_name: "tanvi", email: "tanvi12.bansal@gmail.com" },
//       // { first_name: "Eduardo", email: "eserranor98@gmail.com" },
//       // { first_name: "Itamar", email: "itamartitievsky2006@gmail.com" },
//       // { first_name: "Simaq", email: "msimaqshani79@gmail.com" },
//       // { first_name: "yash", email: "contactjustyash8@gmail.com" },
//       // { first_name: "Vyankatesh", email: "vyankatesharu1@gmail.com" },
//       // { first_name: "gfd", email: "zhokaogurca@gmail.com" },
//       // { first_name: "Minuki", email: "arktmz3373@gmail.com" },
//       // { first_name: "Matylek", email: "galekkarmanov@gmail.com" },
//       // { first_name: "Minh", email: "ductuancb0313@gmail.com" },
//       // { first_name: "Jeroen", email: "jeroenvanstap@gmail.com" },
//       // { first_name: "Mays", email: "maysmayank@gmail.com" },
//       // { first_name: "Veljko", email: "veljkoppantic@gmail.com" }
//     ];
    

//     const result = await sendVOSCOmail(recipients);

//     res.status(200).json({ 
//       success: true, 
//       message: "Bulk emails processed",
//       failedEmails: result.failedEmails.length > 0 ? result.failedEmails : "All emails sent successfully"
//     });

//   } catch (error) {
//     console.error("Error in bulk email sending:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Failed to process bulk emails", 
//       error: error.message 
//     });
//   }
// });


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

    await sendEmail(email, username, undefined, "signup");

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
    if (err) return res.status(500).json({ success: false, message: 'Internal Server Error' });
    if (!user) return res.status(401).json({ success: false, message: info.message });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Internal Server Error' });
      res.status(200).json({ success: true, message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    });
  })(req, res, next);


});


router.get("/protected/profile", requireAuth, async (req, res) => {
  try {

    const user = req.user


    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "user Found", user });

  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: error.message });
  }
});



router.post("/confirmBookingSession", async (req, res) => {
  try {
    const { phoneNumber, email, fullName } = req.body;

    await sendEmail(email, fullName, phoneNumber, "BookingSession");
    await sendAdminNotification(
      "New Session Booked",
      `A new session has been booked with ${fullName}. Contact: ${phoneNumber}. Check the Google sheets for more details.`
    );

    res.status(200).json({ success: true, message: "Email has been sent for BookingSession" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


async function sendAdminNotification(title, message) {
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
        title: title,
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

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

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

router.post("/save-fcm-token", async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }
    console.log("Received Admin FCM Token:", token);
    const k = await User.updateOne({ role: "admin", email: email }, { fcm_token: token }, { upsert: true });

    res.status(200).json({ success: true, message: "Token saved successfully" });
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
})

router.post("/formSubmission", async (req, res) => {
  try {
    const formBody = req.body;
    const formData = formBody.data;

    // Append data to Google Sheets
    await appendToSheet(formData);


    res.status(200).json({
      success: true,
      message: "Form submitted successfully and data saved to Google Sheets"
    });
  } catch (error) {
    console.error("Error processing form submission:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process form submission",
      error: error.message
    });
  }
});

module.exports = router;
