const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const User = require("./model/user");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = 9000;

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

const allowedOrigins = [
  "http://localhost:3000",
  "https://www.spacefordevelopers.in",
  "https://spacefordevelopersbackend-production.up.railway.app",
];

app.use(cookieParser());

// ✅ CORS Configuration (for frontend-backend communication)
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request Origin:", origin); // Log the requesting origin

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin); // Log blocked origin
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ Allows cookies & sessions to be sent
  })
);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/v1/user/auth/google/callback`
},
async (accessToken, refreshToken, profile, done) => {
  try {

    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });  //check if google mail exist in db 

      if (user) {
        // If user exists via email but not linked with Google, update it
        user.googleId = profile.id;
        await user.save();
      } else {
        // Create new user
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          role: "user",
          profilePicture: profile.photos?.[0]?.value || null, // Optional: Store profile pic
        });
        await user.save();
      }
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}
));

passport.serializeUser((user, done) => {
  done(null, user.id); // Save user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
console.log(process.env.NODE_ENV==='production');


app.use(
  session({
    secret: process.env.SESSION_SECRET, // Store this in .env
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Store sessions in MongoDB
      collectionName: "sessions",
    }),
    
  })
);

app.use("/api/v1/user", userRouter);

app.listen(PORT, () => {
  console.log("Server started on PORT:", PORT);
});
